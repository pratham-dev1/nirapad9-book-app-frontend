import React, { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import request from "../../services/http";
import { GET_USERTYPES, UPDATE_USER_TYPE } from "../../constants/Urls";
import CustomTextField from "../../components/CustomTextField";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { queryClient } from "../../config/RQconfig";

const EditUserType = () => {
  const { data: userTypesData } = useQuery("userTypes", () =>
    request(GET_USERTYPES)
  );

  return (
    <>
      <p>Edit user types</p>
      {userTypesData?.data?.map((type: { id: number; userType: string }) => {
        return (
          <div key={type.id}>
            <UserTypeField type={type} />
          </div>
        );
      })}
    </>
  );
};

export default EditUserType;

interface UserTypeFieldProps {
  type: { id: number; userType: string };
}

const UserTypeField: React.FC<UserTypeFieldProps> = ({ type }) => {
  const [value, setValue] = useState(type);
  const [isEdit, setIsEdit] = useState(false);

  const { mutate: updateUserType } = useMutation(
    (body: object) => request(UPDATE_USER_TYPE, "put", body),
    {
      onSuccess: () => {
        setIsEdit(false);
        queryClient.invalidateQueries("userTypes");
      },
    }
  );

  const handleUpdateUserType = () => {
    updateUserType(value);
  };

  return (
    <>
      <CustomTextField
        label=""
        sx={{ width: 400, my: 1, marginBottom: 2, marginRight: 3 }}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setValue({ id: type.id, userType: e.target.value })
        }
        value={value?.userType || ""}
        disabled={!isEdit}
      />
      {!isEdit ? (
        <EditIcon className="mt-10" onClick={() => setIsEdit(true)} />
      ) : (
        <>
          <CheckIcon className="mt-10" onClick={handleUpdateUserType} />{" "}
          <ClearIcon
            className="mt-10"
            onClick={() => {
              setIsEdit(false);
              setValue(type);
            }}
          />
        </>
      )}
    </>
  );
};

import React, { useContext, useEffect, useState } from "react";
import CustomTextField from "../../components/CustomTextField";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import CustomButton from "../../components/CustomButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import CustomCheckBox from "../../components/CustomCheckbox";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { CREATE_USER, GET_USERTYPES,EDIT_USER, GET_SECONDARY_SKILLS_ALL, GET_APPLICATION_LIST } from "../../constants/Urls";
import { GET_SKILLS,GET_SECONDARY_SKILLS } from "../../constants/Urls";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import request from "../../services/http";
import showToast from "../../utils/toast";
import { ToastActionTypes } from "../../utils/Enums";
import Loader from "../../components/Loader";
import { AuthContext } from "../../context/auth/AuthContext";

interface UserTypesProps {
  id: number;
  userType: string;
}
interface SkillsProps {
  id: number;
  skillName: string;
}

interface SecondarySkillsProps {
  id: number;
  secondarySkillName: string;
}

interface FormInputProps {
  username: string;
  fullname: string;
  email: string;
  usertype: UserTypesProps;
  skills: Array<SkillsProps>;
  secondarySkills: Array<SecondarySkillsProps>;
  password: string;
  subscription: any;
  subscriptionId: number;
  appAccess: any
}

interface EditFormProps extends FormInputProps {
  id: number;
  userTypeId: number;
}

interface CreateUserProps {
  formData: EditFormProps;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateUser = (props:CreateUserProps ) => {
  const Subscription = [{label: 'Basic', value:1},{label: 'Advanced', value:2},{label: 'Professional', value:3},{label: 'Enterprise', value:4}]
  const {state} = useContext(AuthContext)
  const { formData, setOpenDialog } = props;
  const {reset, getValues , handleSubmit, control, setValue, trigger, resetField, formState: { errors } } = useForm<FormInputProps>({ 
  //   defaultValues:{
  //   username: editValues?.username,
  //   fullname: editValues?.fullname,
  //   email: editValues?.email,
  //   usertype: editValues?.usertype,
  //   skills:editValues?.skills,
  // }
  });

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showPasswordField, setShowPasswordField] = React.useState<boolean>(true);
  const [userType, setUserType] = useState<number>();
  const [primarySkills, setPrimarySkills] = useState<SkillsProps[]>();
  const [secondarySkillOptions, setSecondarySkillOptions] = useState<SecondarySkillsProps[]>();
  const queryClient = useQueryClient()

  useEffect(() => {
    setUserType(formData?.usertype?.id)
    formData && setShowPasswordField(false) 
    setPrimarySkills(formData?.skills)
    reset({...formData, subscription: Subscription.filter((item) => item.value === formData?.subscriptionId)[0]})
  }, []);

  const { data: userTypesData, isLoading: userTypesLoading, isError: userTypesError } = useQuery('userTypes', () => request(GET_USERTYPES),
  );

  const { data: applications, isLoading: isLoading} = useQuery('Applications', () => request(GET_APPLICATION_LIST));

  const { data: skillsData, isLoading: skillsLoading, isError: skillsError } = useQuery('skills', () => request(GET_SKILLS), {
    enabled: userType === 1,
  });
  
  const { data: secondarySkillsData, isLoading: secondarySkillsLoading, isError: secondarySkillsError } = useQuery(['secondarySkills', primarySkills], () => request(GET_SECONDARY_SKILLS_ALL,'get'
      // { primarySkillIds: primarySkills?.map(skill => skill.id)}
  ), 
  // {enabled: !!primarySkills && primarySkills?.length > 0}
  );

  // useEffect(() => {
  //   const secondarySkillValues = getValues("secondarySkills");
  //   if(primarySkills && primarySkills.length < 1){
  //     resetField("secondarySkills");
  //   }else if(secondarySkillValues && secondarySkillsData?.data) {
  //       const  newSecondarySkillValues = secondarySkillsData?.data.filter((secondarySkillsData:SecondarySkillsProps) => secondarySkillValues.find((secondarySkillValues:SecondarySkillsProps
  //       ) => secondarySkillValues.id === secondarySkillsData.id ));
  //       setValue('secondarySkills', newSecondarySkillValues); 
  //     }
  //     setSecondarySkillOptions(secondarySkillsData?.data)
  // }, [primarySkills, secondarySkillsData]);

  const { mutate:createUser, isLoading: createUserLoading } = useMutation((body: object) => request(CREATE_USER, "post", body),
  {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data.message)
      queryClient.invalidateQueries('user-list');
      setOpenDialog(false)
    },
  })
  const { mutate: updateUser, isLoading: updateUserLoading } = useMutation((body: object) => request(EDIT_USER, "post", body),
  {
    onSuccess: (data) => {
      showToast(ToastActionTypes.SUCCESS, data.message)
      queryClient.invalidateQueries('user-list');
      setOpenDialog(false)
    },
  })

  const generateRandomPassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+';
   
    const allChars = lowercaseChars + uppercaseChars + numberChars + specialChars;
    const passwordLength = 12;
 
    let password = '';
 
    password += lowercaseChars[Math.floor(Math.random() * 26)];
    password += uppercaseChars[Math.floor(Math.random() * 26)];
    password += numberChars[Math.floor(Math.random() * 10)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
 
    for (let i = 4; i < passwordLength; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    password = password.split('').sort(() => Math.random() - 0.5).join('');
   
    return password;
    };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('password', (event.target.checked ? generateRandomPassword() : ""));
    trigger('password');
  };

  const handleResetPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.checked
  ? setShowPasswordField(true)
  : (setShowPasswordField(false), resetField("password"));
  };

  const onSubmit: SubmitHandler<FormInputProps> = (data) => {
    formData ? updateUser({...data, 
      id:formData.id , 
      usertype: data.usertype?.id, 
      skills: data.usertype?.id ==1 ? data.skills?.map((item)=>item.id) : [],
      secondarySkills: data.usertype?.id ==1 ? data.secondarySkills?.map((item)=>item.id) : [],
      subscription: data.subscription.value,
      appAccess: data.appAccess?.map((i:any) => i.id)
    })
    : createUser({...data, 
      usertype: data.usertype?.id, 
      skills: data.skills?.map((item)=>item.id),
      secondarySkills: data.secondarySkills?.map((item)=>item.id),
      orgId: state.orgId,
      subscription: data.subscription.value,
      appAccess: data.appAccess?.map((i:any) => i.id)
    })
  }
  
  return (
    <>
    {(createUserLoading || updateUserLoading) && <Loader />}
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className="d-flex flex-row justify-between mb-30">
          <div className="w-49">
            <CustomTextField
              label="OrgId"
              className="w-100"
              value={state.orgId?.toString()}
              error={!!errors.username}
              disabled
              helperText={errors.username?.message}
            />
          </div>
          <div className="w-49">
            <Controller
              name="username"
              control={control}
              rules={{
                required: "This field is required",
                minLength: {
                  value: 6,
                  message: "Username must be at least 6 characters long",
                },
                pattern: {
                  value: /^\S*$/,
                  message: "Invalid Username",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  label="Username"
                  className="w-100"
                  onChange={onChange}
                  value={value || ""}
                  error={!!errors.username}
                  inputProps={{ maxLength: 30 }}
                  helperText={errors.username?.message}
                />
              )}
            />
          </div>
        </div>
        
        <div className="d-flex flex-row justify-between mb-30">
          <div className="w-49">
            <Controller
              name="fullname"
              control={control}
              rules={{ 
                required: "This field is required",
                minLength: {
                  value: 6,
                  message: "Username must be at least 6 characters long",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  label="Fullname"
                  className="w-100"
                  onChange={onChange}
                  value={value || ""}
                  error={!!errors.fullname}
                  helperText={errors.fullname?.message}
                  inputProps={{ maxLength: 40 }}
                />
              )}
            />
          </div>
          <div className="w-49">
            <Controller
              name="email"
              control={control}
              rules={{
                required: "This field is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  label="Email"
                  className="w-100"
                  onChange={onChange}
                  value={value || ""}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="w-100 d-flex flex-column mb-30">
          <Controller
            name="subscription"
            control={control}
            rules={{ required: "This field is required" }}
            render={({ field: { onChange,value } }) => (
              <CustomAutocomplete
                options={Subscription || []}
                value = {value || null}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                label="Subscription Type"
                onChange={(_, v) => onChange(v)}
                error={!!errors.subscription}
                helperText={errors.subscription?.message as string}
              />
            )}
          />
        </div>

        <div className="d-flex flex-row mb-30">
          <div className="mr-20 w-30">
            <Controller
              name="usertype"
              rules={{ required: "This field is required" }}
              control={control}
              render={({ field: { onChange,value } }) => (
                <CustomAutocomplete
                  options={userTypesData?.data}
                  getOptionLabel={(userTypesOptions: UserTypesProps) =>
                    userTypesOptions.userType
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value = {value || null}
                  label="User type"
                  onChange={(_, selectedValue) => {
                    onChange(selectedValue);
                    setUserType(selectedValue?.id);
                    resetField("skills");
                    resetField("secondarySkills");
                  }}
                  error={!!errors.usertype}
                  helperText={errors.usertype?.message}
                />
              )}
            />
          </div>
          <div className="mr-20 w-30">
            <Controller
              name="appAccess"
              rules={{ required: "This field is required" }}
              control={control}
              render={({ field: { onChange,value } }) => (
                <CustomAutocomplete
                  options={applications?.data || []}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value = {value || []}
                  multiple
                  label="App Access"
                  onChange={(_, selectedValue) => {
                    onChange(selectedValue);
                  }}
                  error={!!errors.appAccess}
                  helperText={errors.appAccess?.message as string}
                />
              )}
            />
          </div>
          {userType === 1 &&  (
            <div className="mr-20 w-31">
              <Controller
                name="skills"
                control={control}
                render={({ field: { onChange,value } }) => (
                  <CustomAutocomplete
                    options={skillsData?.data}
                    getOptionLabel={(skillOptions: SkillsProps) =>
                      skillOptions.skillName
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value = {value || []}
                    label="Primary Skills"
                    className="mr-25"
                    multiple={true}
                    onChange={(_, selectedValue) => {
                      onChange(selectedValue);
                      setPrimarySkills(selectedValue);
                    }}
                    getOptionDisabled={(option) =>
                      value?.length >= 5 && !value.some((selected) => selected.id === option.id)
                    }
                  />
                )}
              />
            </div>
          )}
          {userType === 1 && primarySkills && primarySkills?.length > 0  && (
            <div className="w-30">
              <Controller
                name="secondarySkills"
                control={control}
                render={({ field: { onChange,value } }) => (
                  <CustomAutocomplete
                    options={secondarySkillsData?.data || []}
                    getOptionLabel={(skillOptions: SecondarySkillsProps) =>
                      skillOptions.secondarySkillName
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value = {value || []}
                    label="Secondary Skills"
                    multiple={true}
                    onChange={(_, selectedValue) => {
                      onChange(selectedValue);
                    }}
                    getOptionDisabled={(option) =>
                      value?.length >= 5 && !value.some((selected) => selected.id === option.id)
                    }
                  />
                )}
              />
            </div>
            
          )}
        </div>
        
        <div className="form-col d-flex flex-column">
          {formData && (
          <CustomCheckBox
            label="reset password"
            className="reset-password-label"
            // labelPlacement="end"
            onChange={handleResetPasswordChange}
          />
          )}

          <div className="w-100">
            {showPasswordField == true && (
              <Controller
                name="password"
                rules={{
                  required: "This field is required",
                  pattern: {
                    value:
                      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,28}$/,
                    message:
                    "Password must contain 8 to 28 characters, 1 number, 1 special character (!, @, #, $, %, ^, &, *, (, ), _, +), 1 uppercase letter, and 1 lowercase letter",
                  },
                }}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    onChange={onChange}
                    value={value || ""}
                    className="w-100"
                    inputprops={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            )}
          </div>
          {showPasswordField == true && (
          <CustomCheckBox
            label="Auto generated password"
            labelPlacement="end"
            onChange={handleCheckboxChange}
          />
          )}
        </div>
        <div className="d-flex justify-center">
          <CustomButton
            type="submit"
            label={formData ? "Update User" : "Create User"}
            className="primary_btns"
            sx={{ width: 300, my: 1 }}
          />
        </div>
      </div>
    </form>
    </>
  );
};

export default CreateUser;

import React, { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import BackArrowIcon from "../styles/icons/BackArrowIcon";
import { TextField, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import request from "../services/http";
import { ADD_QUESTION, EDIT_QUESTION } from "../constants/Urls";
import { queryClient } from "../config/RQconfig";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";
import CustomTextField from "../components/CustomTextField";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomCheckBox from "../components/CustomCheckbox";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";

interface FormInputProps {
  question: string;
  type: any;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  option4: string | null;
  option5: string | null;
}

const AddQuestion: FC<{popupMode?: boolean, setOpenAddQuestionDialog?: Function}> = ({popupMode, setOpenAddQuestionDialog}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.data;
  const [questionType, setQuestionType] = useState("text");
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitted },
    reset,
    watch,
    setValue
  } = useForm<FormInputProps>({
    defaultValues:{
        type: 'Text'
    }
  });

  useEffect(() => {
    formData && reset(formData);
  }, [formData]);

  const { mutate, isLoading } = useMutation(
    (body: object) =>
      request(
        formData ? EDIT_QUESTION : ADD_QUESTION,
        "post",
        formData ? { ...body, id: formData.id } : body
      ),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('questions')
        showToast(ToastActionTypes.SUCCESS, data?.message);
        popupMode ? setOpenAddQuestionDialog?.(false) : navigate(-1)
      },
    }
  );

  const onSubmit = (formdata: FormInputProps) => {
    mutate({...formdata, question: formdata.question.trim()});
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="page-wrapper top_algn-clr-mode">
        {!popupMode && <div className="d-flex justify-between items-center mb-20">
          <h1 className="mb-zero">
            <span
              className="back-to mr-10 cursur-pointer"
              onClick={() => navigate(-1)}
            >
              <BackArrowIcon />
            </span>
            {formData ? 'Edit' : 'Add New' } Questions
          </h1>
        </div>}

        <div className="card-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-100 mw-700">
              <div className="w-100 mb-10">
                <Controller
                  name="question"
                  control={control}
                  rules={{ 
                    required: "This field is required",
                    validate: (value) => value.trim() !== "" || "This field is required", 
                  }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label={`Question (Text ${watch('question')?.length || 0}/200 Characters)`}
                      className="w-100"
                      onChange={onChange}
                      value={value || ""}
                      error={!!errors?.question}
                      helperText={errors?.question?.message}
                      inputProps={{ maxLength: 200 }}
                    />
                  )}
                />
              </div>
              {/* <div className="w-100 mb-20">
                <Controller
                  name="required"
                  control={control}
                  render={({ field: { onChange,value } }) => (
                    <CustomCheckBox
                      label="Mandatory Question"
                      onChange={onChange}
                      labelPlacement='end'
                      checked={value || false}
                    />
                  )}
                />
              </div> */}
              <div className="w-100 mb-20">
                <Controller
                  name="type"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomAutocomplete
                      options={["Text", "Single Choice", "Multiple Choice", "Boolean", "Rating"]}
                      onChange={(e, v) => {
                        onChange(v)
                        setValue('option1', null)
                        setValue('option2', null)
                        setValue('option3', null)
                        setValue('option4', null)
                        setValue('option5', null)
                      }}
                      value={value || null}
                      label="Question Type"
                      disableClearable
                    />
                  )}
                />
              </div>

              {(watch('type') === "Multiple Choice" || watch('type') === "Single Choice" || watch('type') === "Boolean") && (
                <div className="w-100 mb-50">
                  <Controller
                    name="option1"
                    control={control}
                    rules={{ 
                      required: "This field is required",
                      validate: (value) => value?.trim() !== "" || "This field is required", 
                    }}
                    render={({ field: { onChange, value } }) => (
                      <CustomTextField
                        label={`Option 1 (Text ${watch('option1')?.length || 0}/50 Characters)`}
                        className="w-100 mb-10"
                        onChange={onChange}
                        value={value || ""}
                        error={!!errors?.option1}
                        helperText={errors?.option1?.message}
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                  <Controller
                    name="option2"
                    control={control}
                    rules={{ 
                      required: "This field is required",
                      validate: (value) => value?.trim() !== "" || "This field is required", 
                    }}
                    render={({ field: { onChange, value } }) => (
                      <CustomTextField
                        label={`Option 2 (Text ${watch('option2')?.length || 0}/50 Characters)`}
                        className="w-100 mb-10"
                        onChange={onChange}
                        value={value || ""}
                        error={!!errors?.option2}
                        helperText={errors?.option2?.message}
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                  {watch('type') !== "Boolean" && <Controller
                    name="option3"
                    control={control}
                    rules={{ 
                      required: "This field is required",
                      validate: (value) => value?.trim() !== "" || "This field is required", 
                    }}
                    render={({ field: { onChange, value } }) => (
                      <CustomTextField
                        label={`Option 3 (Text ${watch('option3')?.length || 0}/50 Characters)`}
                        className="w-100 mb-10"
                        onChange={onChange}
                        value={value || ""}
                        error={!!errors?.option3}
                        helperText={errors?.option3?.message}
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />}
                  {watch('type') !== "Boolean" &&
                  <> 
                  <Controller
                  name="option4"
                  control={control}
                  // rules={{ 
                  //   required: "This field is required",
                  //   validate: (value) => value?.trim() !== "" || "This field is required", 
                  // }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label={`Option 4 (Text ${watch('option4')?.length || 0}/50 Characters)`}
                      className="w-100 mb-10"
                      onChange={onChange}
                      value={value || ""}
                      // error={!!errors?.option4}
                      // helperText={errors?.option4?.message}
                      inputProps={{ maxLength: 50 }}
                    />
                  )}
                />
                <Controller
                  name="option5"
                  control={control}
                  // rules={{ 
                  //   required: "This field is required",
                  //   validate: (value) => value?.trim() !== "" || "This field is required", 
                  // }}
                  render={({ field: { onChange, value } }) => (
                    <CustomTextField
                      label={`Option 5 (Text ${watch('option5')?.length || 0}/50 Characters)`}
                      className="w-100 mb-10"
                      onChange={onChange}
                      value={value || ""}
                      // error={!!errors?.option5}
                      // helperText={errors?.option5?.message}
                      inputProps={{ maxLength: 50 }}
                    />
                  )}
                />
                </>
                }
                </div>
              )}
              

              <div className="w-100 mt-50 d-flex justify-center">
                {!popupMode && <CustomButton label="Cancel" className="secondary_btns mr-25" onClick={() => navigate(-1)} />}
                <CustomButton type="submit" label="Save" className="primary_btns mr-0" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <UnsavedChangesDialog when={isDirty && !isSubmitted} />

    </>
  );
};
export default AddQuestion;

//@ts-nocheck
import React, { FC, useState } from "react";
import CustomButton from "../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../components/CustomTextField";
import CustomRadioButton from "../components/CustomRadioGroup";
import CustomCheckBox from "../components/CustomCheckbox";
import { SUBMIT_OPEN_AVAILABILITY_FEEDBACK } from "../constants/Urls";
import { useMutation } from "react-query";
import request from "../services/http";
import Loader from "../components/Loader";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import CalendarIcon from "../styles/icons/CalendarIcon";
import ClockIcon from "../styles/icons/ClockIcon";
import dayjs from "dayjs";
import { Dialog, DialogContent, Rating } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import momentTimezone from "moment-timezone"

const OpenSlotFeedbackForm: FC<{ questions: any[]; setUiMode: any, slot: any, mutateSendEvent:any, eventInfo: any, slots: any[], setSelectedSlot: any, showCommentBox: boolean, selectedTimezone}> = ({
  questions,
  setUiMode,
  slot,
  mutateSendEvent,
  eventInfo,
  slots,
  setSelectedSlot,
  showCommentBox,
  selectedTimezone
}) => {
  const current_timeZone = dayjs.tz.guess()
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const [nextTwoSlots, setNextTwoSlots] = useState([])
  const [openDeleteDialog,setOpenDeleteDialog] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState()
  const [comments, setComments] = useState('')

  const { mutate, isLoading } = useMutation((body: object) => request(SUBMIT_OPEN_AVAILABILITY_FEEDBACK, "post", {...body, availabilityId: slot?.id}),{
    onSuccess: (data) => {
      setUiMode("confirmation")
      // showToast(ToastActionTypes.SUCCESS, data?.message)
    }
  })

  const onSubmit = (formData) => {
    let eventDetails = eventInfo
    if (selectedTimeSlot) {
      eventDetails.datetime = selectedTimeSlot?.datetime
      eventDetails.id = selectedTimeSlot?.id
    }
    setNextTwoSlots([])
    mutateSendEvent({...eventDetails, comments, guestTimezone: selectedTimezone?.value || current_timeZone, systemTimezone: current_timeZone})
    .then((data) => {
      if(!data?.isTagDeleted) {
        const formattedQuestions = questions.map((item) => ({
          question: item.question,
          answer: formData[item.question], // Use empty string if no answer
          type: item.type,
        }));
        !data?.isLimitOverToBookSlot && mutate({questions: formattedQuestions.filter(i => (i.answer && i))})
      }
    })
    .catch(err => {
      if(err.response.status === 404) {
        let selectedSlotIndex = slots.findIndex(i => i.id === slot.id)
        setNextTwoSlots([slots[selectedSlotIndex + 1], slots[selectedSlotIndex + 2]].filter(i => i !== undefined))
      }
  })
  };
  const getFormFields = () => {
    return questions.map((item, index) => {
      if (item.type === "Text") {
        return (
          <>
            <div className="qus-item">
              <h3>{item.question}</h3>
              <Controller
                name={item.question}
                control={control}
                rules={{ required: item.open_availability_question.required ? "This field is required" : false }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextField
                    label={`Text ${watch(item.question)?.length || 0}/180 Characters`}
                    className="w-100"
                    onChange={onChange}
                    value={value || ""}
                    error={!!errors[item.question]}
                    helperText={errors[item.question]?.message}
                    inputProps={{ maxLength: 180 }}
                  />
                )}
              />
            </div> 

          </>
        );
      } else if (item.type === "Single Choice") {
        return (
          <>
            <div className="qus-item">
              <h3>{item.question}</h3>
              <Controller
                name={item.question}
                control={control}
                rules={{ required: item.open_availability_question.required ? "This field is required" : false }}
                // defaultValue={item.option1}
                render={({ field: { onChange, value } }) => (
                  <CustomRadioButton
                    label=""
                    options={[
                      ...(item.option1 ? [{ value: item.option1, label: item.option1 }] : []),
                      ...(item.option2 ? [{ value: item.option2, label: item.option2 }] : []),
                      ...(item.option3 ? [{ value: item.option3, label: item.option3 }] : []),
                      ...(item.option4 ? [{ value: item.option4, label: item.option4 }] : []),
                      ...(item.option5 ? [{ value: item.option5, label: item.option5 }] : []),
                    ]}
                    style={{ display: "flex" }}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            {(item.open_availability_question.required && errors[item.question]) && (
              <small style={{ color: "red" }}>This field is required</small>
            )}
          </>
        );
      } 
      else if (item.type === "Boolean") {
        return (
          <>
            <div className="qus-item">
              <h3>{item.question}</h3>
              <Controller
                name={item.question}
                control={control}
                rules={{ required: item.open_availability_question.required ? "This field is required" : false }}
                // defaultValue={item.option1}
                render={({ field: { onChange, value } }) => (
                  <CustomRadioButton
                    label=""
                    options={[
                      ...(item.option1 ? [{ value: item.option1, label: item.option1 }] : []),
                      ...(item.option2 ? [{ value: item.option2, label: item.option2 }] : []),
                    ]}
                    style={{ display: "flex" }}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            {(item.open_availability_question.required && errors[item.question]) && (
              <small style={{ color: "red" }}>This field is required</small>
            )}
          </>
        );
      }
      else if (item.type === "Rating") {
        return (
          <>
            <div className="qus-item">
              <h3>{item.question}</h3>
              <Controller
                name={item.question}
                control={control}
                rules={{ required: item.open_availability_question.required ? "This field is required" : false }}
                render={({ field: { onChange, value} }) => (
                  <Rating size="large" onChange={(e,v) => onChange(v)}  />
                )}
              />
            </div>
            {(item.open_availability_question.required && errors[item.question]) && (
              <small style={{ color: "red" }}>This field is required</small>
            )}
          </>
          )
      }
      else {
        return (
          <>
            <div className="qus-item">
              <h3>{item.question}</h3>
              <Controller
                name={item.question}
                control={control}
                rules={{ required: item.open_availability_question.required ? "This field is required" : false }} // Validation rule
                // defaultValue={[]} // Default value as an empty array for multiple selections
                render={({ field: { onChange, value = [] } }) => {
                  // Handle changes to checkboxes
                  const handleCheckBoxChange = (option) => {
                    if (value.includes(option)) {
                      // If the option is already selected, remove it
                      onChange(value.filter((val) => val !== option));
                    } else {
                      // Otherwise, add the option to the array of selected values
                      onChange([...value, option]);
                    }
                  };

                  let checkBoxes = [];

                  if (item.option1) {
                    checkBoxes.push(
                      <CustomCheckBox
                        key="option1"
                        label={item.option1}
                        onChange={(e, v) => handleCheckBoxChange(item.option1)}
                        labelPlacement="end"
                        checked={value.includes(item.option1)} // Check if it's selected
                      />
                    );
                  }

                  if (item.option2) {
                    checkBoxes.push(
                      <CustomCheckBox
                        key="option2"
                        label={item.option2}
                        onChange={(e, v) => handleCheckBoxChange(item.option2)}
                        labelPlacement="end"
                        checked={value.includes(item.option2)} // Check if it's selected
                      />
                    );
                  }

                  if (item.option3) {
                    checkBoxes.push(
                      <CustomCheckBox
                        key="option3"
                        label={item.option3}
                        onChange={(e, v) => handleCheckBoxChange(item.option3)}
                        labelPlacement="end"
                        checked={value.includes(item.option3)} // Check if it's selected
                      />
                    );
                  }

                  if (item.option4) {
                    checkBoxes.push(
                      <CustomCheckBox
                        key="option4"
                        label={item.option4}
                        onChange={(e, v) => handleCheckBoxChange(item.option4)}
                        labelPlacement="end"
                        checked={value.includes(item.option4)} // Check if it's selected
                      />
                    );
                  }

                  if (item.option5) {
                    checkBoxes.push(
                      <CustomCheckBox
                        key="option5"
                        label={item.option5}
                        onChange={(e, v) => handleCheckBoxChange(item.option5)}
                        labelPlacement="end"
                        checked={value.includes(item.option5)} // Check if it's selected
                      />
                    );
                  }

                  return checkBoxes;
                }}
              />
            </div>
            {(item.open_availability_question.required && errors[item.question]) && (
              <small style={{ color: "red" }}>This field is required</small>
            )}
          </>
        );
      }
    });
  };

  return (
    <>
    {isLoading && <Loader />}
      <h1 className="text-center mb-20">OpenSlotFeedbackForm</h1>
      <div className="date-time-dtls d-flex mb-20">
        <span className="mr-5"><CalendarIcon /></span>
        <span className="mr-20">{dayjs(eventInfo?.datetime).tz(current_timeZone).format("DD MMM, YYYY")}</span>
        <span className="mr-5"><ClockIcon /></span>
        <span>{dayjs(eventInfo?.datetime).tz(current_timeZone).format("h:mm A")}</span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {getFormFields()} <br />
        {showCommentBox && <><h3>Comments</h3> Text {comments?.length || 0}/208 Characters
        <textarea maxLength={208} style={{width: '100%', height: '100px'}} onChange={(e) => setComments(e.target.value)} value={comments} />
        </>}
        <div className="d-flex justify-center items-center mt-50">
          <CustomButton
            label="Back"
            className="secondary_btns mr-20"
            onClick={() => setUiMode("slots")}
          />
          <CustomButton type="submit" className="primary_btns mr-0" label="Submit" /> 
          
        </div>
        <Dialog
        open={nextTwoSlots.length > 0}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="reason-popup"
      >
        <div className="popup-header">
          <h2>Choose Another Slot</h2>
          <CloseIcon onClick={() => {setNextTwoSlots([]); setSelectedTimeSlot(null); }} />
        </div>
        <DialogContent>
          {nextTwoSlots?.map((item, index) => {
            return <> 
            <div
            key={index}
            onClick={() => {setSelectedTimeSlot(item); setSelectedSlot({...item, time: dayjs(item.datetime).format("h:mm A")});}}
            style={{
              backgroundColor: selectedTimeSlot?.datetime === item?.datetime ? '#C5DEF7' : '#EBECF0',
              textAlign: "center",
              padding: "16px 40px",
              borderRadius: "5px",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            {dayjs(item?.datetime).format("h:mm A")}
          </div> <br />
          </>
          }) }
          
          <div className="d-flex justify-center">
            <CustomButton label="Cancel" className="secondary_btns mr-20" onClick={() => {setNextTwoSlots([]); setSelectedTimeSlot(null);}} />
            <CustomButton onClick={handleSubmit(onSubmit)} className="primary_btns mr-0" label="Submit" />
          </div>
        </DialogContent>
      </Dialog>
      </form>
    </>
  );
};

export default OpenSlotFeedbackForm;

import { Dialog, DialogActions, DialogContent } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import CustomTextField from "../components/CustomTextField";
import { Controller, useForm } from "react-hook-form";
import CustomButton from "../components/CustomButton";
import CustomAutocomplete from "../components/CustomAutocomplete";
import dayjs, { Dayjs } from "dayjs";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomTimePicker from "../components/CustomTimePicker";
import { EventsContext } from "../context/event/EventsContext";
import GroupList from "./GroupList";
import request from "../services/http";
import { CREATE_GROUP_EVENT, GET_GENERAL_TEMPLATES, GET_GROUP_LIST_WITH_MEMBERS } from "../constants/Urls";
import { useMutation, useQuery } from "react-query";
import showToast from "../utils/toast";
import { ToastActionTypes } from "../utils/Enums";
import Loader from "../components/Loader";
import ViewTemplate from "../components/ViewTemplate";
import CustomRichTextEditor from "../components/CustomRichTextEditor";
import { AuthContext } from "../context/auth/AuthContext";

interface FormInputProps {
  title: string;
  date: Dayjs;
  email: string;
  startTime: Dayjs;
  members: any[];
  eventTime: number;
  groups: any[];
  template: any;
  newTemplate: any;
}

const CreateGroupEvent = ({value}:any) => {
  const { emailData } = useContext(EventsContext);
  const [uiMode, setUIMode] = useState(1);
  const [memberOptions, setMemberOptions] = useState([])
  const { state } = useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone

  const {data: GroupsData} = useQuery(['group-list'],() => request(GET_GROUP_LIST_WITH_MEMBERS, "get"))
  const { data: templatesData } = useQuery('general-templates', () => request(`${GET_GENERAL_TEMPLATES}?type=create`))

  const { mutate: mutateCreateEvent, isLoading } = useMutation((body: object) => request(CREATE_GROUP_EVENT, "post", body), {
    onError: (error: any) => {
      let message = '';
      if (error.response.data?.failedEmails?.length > 0) {
        message = (
          `${error.response.data.message} \n ${error.response.data?.failedEmails.map((item: any) => `${item} \n`)}`
        )
      }
      else {
        message = error.response.data.message;
      }
      showToast(ToastActionTypes.ERROR, message)
    }
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInputProps>();

  const handleCreateEvent = async (formdata: FormInputProps) => {
    const currentDateTime = dayjs().tz(default_timeZone);
    const startDateTime = dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime.format("HH:mm")}`, default_timeZone);
    if (currentDateTime > startDateTime) {
      showToast(ToastActionTypes.ERROR, 'Please choose a time that is not in the past');
      return;
    }
    const eventTime = watch('eventTime')
    mutateCreateEvent({
        title: formdata.title, 
        members: formdata.members,
        email: formdata.email, 
        startDateTime: dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime.format("HH:mm")}`, default_timeZone).toISOString(),
        endDateTime: dayjs.tz(`${formdata.date?.format("YYYY-MM-DD")} ${formdata.startTime.format("HH:mm")}`, default_timeZone).add(eventTime, 'minutes').toISOString(),
        template: formdata.newTemplate
    });
  };
  useEffect(() => {
    () => {
      console.log('unmount')
    }
  },[])
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
    {isLoading && <Loader />}
      {uiMode === 1 ? (
        <>
          <div className="d-flex justify-end">
            <CustomButton
              label="See Groups"
              sx={{ float: "right" }}
              onClick={() => setUIMode(2)}
            />
          </div>
          <form
            onSubmit={handleSubmit(handleCreateEvent)}
            onKeyDown={handleKeyDown}
            className="create-event-form"
          >
            <h3>Create Group Event</h3>
            <div className="d-flex flex-row justify-between">
              <div className="w-32 mb-20">
                  <Controller
                    name="title"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field: { onChange } }) => (
                      <CustomTextField
                        label="Title"
                        size="small"
                        fullWidth
                        sx={{ marginBottom: 2, width: 300 }}
                        onChange={onChange}
                        error={!!errors?.title}
                        helperText={errors?.title?.message}
                        inputProps={{ maxLength: 30 }}
                      />
                    )}
                  />
              </div>
              <div className="w-32 mb-20">
                <Controller
                  name="groups"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange, value } }) => (
                    <CustomAutocomplete
                      label="Select group"
                      options={ GroupsData?.data || []}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e,v) =>{ 
                          onChange(v)
                          let members = v?.flatMap((item: any) => item.groupMembers) || []
                          const removedDuplicates = members.reduce((accumulator: any, current: any) => {
                              if (!accumulator.some((item: any) => item.id === current.id)) {
                                accumulator.push(current);
                              }
                              return accumulator;
                            }, []);
                          setMemberOptions(removedDuplicates)
                          setValue('members', removedDuplicates)
                      }}
                      error={!!errors?.groups}
                      helperText={errors?.groups?.message as string}
                      value={value || []}
                      multiple
                    />
                  )}
                />
              </div>
              <div className="w-32 mb-20">
                <Controller
                  name="members"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange, value } }) => (
                    <CustomAutocomplete
                      label="Members"
                      options={memberOptions}
                      getOptionLabel={option => option.email}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(e,v) => onChange(v)}
                      error={!!errors?.members}
                      helperText={errors?.members?.message as string}
                      value={value || []}
                      multiple
                      limitTags={3}
                      disableClearable
                    />
                  )}
                />
              </div>
              <div className="w-32 mb-20">
                <Controller
                  name="eventTime"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange } }) => (
                    <CustomAutocomplete
                      label="Event Time"
                      options={[15, 30, 45, 60]}
                      getOptionLabel={(option) => option + " min"}
                      onChange={(e, v) => onChange(v)}
                      error={!!errors?.eventTime}
                      helperText={errors?.eventTime?.message}
                    />
                  )}
                />
              </div>
              <div className="w-32 mb-20">
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange } }) => (
                    <CustomDatePicker
                      label="Date"
                      size="small"
                      className="avail-date-filter"
                      onChange={onChange}
                      disablePast={true}
                      error={!!errors?.date}
                      helperText={errors?.date?.message}
                    />
                  )}
                />
              </div>
              <div className="w-32 mb-20">
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange } }) => (
                    <CustomTimePicker
                      label="Time"
                      size="small"
                      className="avail-date-filter"
                      onChange={onChange}
                      error={!!errors?.startTime}
                      helperText={errors?.startTime?.message}
                    />
                  )}
                />
              </div>
            </div>
            {/* </div> */}
            <div className="d-flex flex-row">
              <div className="w-32 mb-20 mr-25">
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange } }) => (
                    <CustomAutocomplete
                      label="Select Email"
                      options={emailData || []}
                      getOptionLabel={(option) => option.email}
                      onChange={(e, v) => onChange(v?.email)}
                      error={!!errors?.email}
                      helperText={errors?.email?.message}
                      disableClearable={true}
                    />
                  )}
                />
              </div>
              <div className="w-32 mb-20">
                <Controller
                  name="template"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({ field: { onChange, value } }) => (
                    <CustomAutocomplete
                      label='Select Template'
                      options={templatesData?.data || []}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, selectedValue) => {
                        onChange(selectedValue);
                        setValue("newTemplate" ,selectedValue.template)
                      }}
                      value={value || null}
                      error={!!errors.template}
                      helperText={errors?.template?.message as string}
                      disableClearable
                    />
                  )}
                />
              </div>
            </div>
            { watch("template") && <ViewTemplate value={watch('template')?.template} /> }
            <div className="w-100 mt-30 mb-70">
              <Controller
                name="newTemplate"
                control={control}
                rules={{ required: "This field is required" }}
                render={({ field: { onChange, value } }) => (
                  <CustomRichTextEditor 
                    onChange={onChange}
                    value={value}
                  />
                )}
              />
            </div>
            <div className="form-act">
              <CustomButton
                className="primary_btns"
                label="Save"
                type="submit"
              />
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="d-flex justify-end">
            <CustomButton
              label="Back"
              className="cancel-btn"
              sx={{ float: "right" }}
              onClick={() => setUIMode(1)}
            />
          </div>
          <GroupList />
        </>
      )}
    </>
  );
};

export default CreateGroupEvent;

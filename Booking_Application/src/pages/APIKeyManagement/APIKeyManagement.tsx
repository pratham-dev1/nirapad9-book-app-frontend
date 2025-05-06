import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

import {
  CREATE_API_KEY,
  DELETE_API_KEY,
  GET_RESOURCES,
  REGENERATE_API_KEY,
} from "../../constants/Urls";
import CustomAutocomplete from "../../components/CustomAutocomplete";
import CustomTextField from "../../components/CustomTextField";
import CustomButton from "../../components/CustomButton";
import { ToastActionTypes } from "../../utils/Enums";
import CopyIcon from "../../styles/icons/CopyIcon";
import showToast from "../../utils/toast";
import request from "../../services/http";
import { IconButton } from "@mui/material";

interface ResourceOptionType {
  resourceId: number;
  resourceName: string;
}

type FormInputProps = {
  organizationId: string;
  resource: ResourceOptionType;
  secretKey: string;
};

enum ApiKeyAction {
  CREATE_API_KEY = "Create API Key",
  REGENERATE_API_KEY = "Regenerate API Key",
  DELETE_API_KEY = "Delete API Key",
}

type APIKeyActionType = {
  currentAction: ApiKeyAction | null;
};

const APIKeyManagement: React.FC = () => {
  const [apiKeyAction, setAPIKeyAction] = useState<APIKeyActionType>({
    currentAction: ApiKeyAction.CREATE_API_KEY,
  });
  const [apiKey, setAPIKey] = useState<string | null>();

  // API triggers
  const { data: resourceResponse } = useQuery(["get-resources"], () =>
    request(GET_RESOURCES)
  );

  const { mutate: createAPIKey }: any = useMutation(
    (body: object) => request(CREATE_API_KEY, "post", body),
    {
      onSuccess: (data) => {
        setAPIKey(data.apiKey);
        showToast(ToastActionTypes.SUCCESS, data.message);
      },
    }
  );

  const { mutate: regenerateAPIKey }: any = useMutation(
    (body: object) => request(REGENERATE_API_KEY, "put", body),
    {
      onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, data.message);
        setAPIKey(data.apiKey);
      },
    }
  );

  const { mutate: deleteAPIKey }: any = useMutation(
    (body: object) => request(DELETE_API_KEY, "delete", body),
    {
      onSuccess: (data) => {
        showToast(ToastActionTypes.SUCCESS, data.message);
        setAPIKey(null);
      },
    }
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormInputProps>();

  const handleCreateAPIKey = (formdata: FormInputProps): void => {
    const body = {
      orgId: formdata.organizationId,
      secretKey: formdata.secretKey,
      resourceId: formdata.resource.resourceId,
    };
    createAPIKey(body);
  };

  const handleRegenerateAPIKey = (formdata: FormInputProps) => {
    const body = {
      orgId: formdata.organizationId,
      secretKey: formdata.secretKey,
      resourceId: formdata.resource.resourceId,
    };
    regenerateAPIKey(body);
  };

  const handleDeleteAPIKey = (formdata: FormInputProps): void => {
    const body = {
      orgId: formdata.organizationId,
      resourceId: formdata.resource.resourceId,
    };
    deleteAPIKey(body);
  };

  const handleAction = (action: ApiKeyAction) => {
    reset()
    setAPIKeyAction({ currentAction: action });
  };

  const renderSecretKey = (): React.ReactElement => (
    <Controller
      name="secretKey"
      control={control}
      rules={{ required: "This field is required" }}
      render={({ field: { onChange, value } }) => (
        <CustomTextField
          label="Secret Key"
          onChange={onChange}
          value={value || ""}
          error={!!errors?.secretKey}
          helperText={errors.secretKey?.message}
        />
      )}
    />
  );

  const renderOrganizationId = (): React.ReactElement => (
    <Controller
      name="organizationId"
      control={control}
      rules={{
        required: "This field is required",
        minLength: {
          value: 9,
          message: "Organization ID must be at least 9 characters long",
        },
        maxLength: {
          value: 9,
          message: "Organization ID must be at most 9 characters long",
        },
      }}
      render={({ field: { onChange, value } }) => (
        <CustomTextField
          label="Organization Id"
          onChange={onChange}
          value={value || ""}
          error={!!errors?.organizationId}
          helperText={errors.organizationId?.message}
        />
      )}
    />
  );

  const renderCreateAPIContent = (): React.ReactElement => (
    <Box
      sx={{
        display: "flex",
        rowGap: "8px",
        flexDirection: "column",
      }}
    >
      {renderOrganizationId()}
      {renderSecretKey()}
    </Box>
  );

  const renderRegenerateAPIContent = (): React.ReactElement => (
    <Box
      sx={{
        display: "flex",
        rowGap: "8px",
        flexDirection: "column",
      }}
    >
      {renderOrganizationId()}
      {renderSecretKey()}
    </Box>
  );

  const renderDeleteAPIContent = (): React.ReactElement => (
    <Box
      sx={{
        display: "flex",
        rowGap: "8px",
        flexDirection: "column",
      }}
    >
      {renderOrganizationId()}
    </Box>
  );

  const renderContent = (): React.ReactElement => {
    switch (apiKeyAction.currentAction) {
      case ApiKeyAction.CREATE_API_KEY:
        return renderCreateAPIContent();
      case ApiKeyAction.REGENERATE_API_KEY:
        return renderRegenerateAPIContent();
      case ApiKeyAction.DELETE_API_KEY:
        return renderDeleteAPIContent();
      default:
        return <Typography>Please select an action.</Typography>;
    }
  };

  const onSubmit = (formdata: FormInputProps) => {
    switch (apiKeyAction.currentAction) {
      case ApiKeyAction.CREATE_API_KEY:
        return handleCreateAPIKey(formdata);
      case ApiKeyAction.DELETE_API_KEY:
        return handleDeleteAPIKey(formdata);
      case ApiKeyAction.REGENERATE_API_KEY:
        return handleRegenerateAPIKey(formdata);
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey).then(() => {
        showToast(ToastActionTypes.SUCCESS, "Copied!");
      });
    }
  };

  const renderAPIKeyActions = (): React.ReactElement => (
    <Grid container spacing={3}>
      {Object.values(ApiKeyAction).map((action) => (
        <Grid item xs={10} md={2} key={action}>
          <Paper
            elevation={3}
            className={`api-key-action ${
              apiKeyAction.currentAction === action ? "Mui-selected" : ""
            } `}
            sx={{
              padding: 2,
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => handleAction(action)}
          >
            {action}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderResource=():React.ReactElement=>  <Grid item xs={10} md={6}>
  <Controller
    name="resource"
    control={control}
    rules={{ required: "This field is required" }}
    render={({ field: { onChange, value } }) => (
      <CustomAutocomplete
        label="Resource"
        options={resourceResponse?.data || {}}
        onChange={(_, selectedValue) => onChange(selectedValue)}
        getOptionLabel={(option) => option?.resourceName || ""}
        value={value || null}
        error={!!errors.resource}
        helperText={errors.resource?.message}
        className="xs-2"
      />
    )}
  />
</Grid>

  return (
    <Box sx={{ p: 3 ,paddingLeft:'10%'}}>
      <Typography variant="h4" gutterBottom>
        Manage your API Key for the resources
      </Typography>

      {renderAPIKeyActions()}

      <Box sx={{ mt: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            spacing={2}
            sx={{
              display: "flex",
              rowGap: "8px",
              flexDirection: "column",
            }}
          >
          {renderResource()}

            <Grid item xs={10} md={6}>
              {renderContent()}
            </Grid>

            <Grid item xs={12}>
              <CustomButton
                label={apiKeyAction.currentAction ?? ""}
                type="submit"
              />
            </Grid>
          </Grid>
        </form>

        {apiKey && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Typography
              sx={{
                maxWidth: "256px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={handleCopy}
            >
              {apiKey}
            </Typography>

            <IconButton
              size="small"
              sx={{ ml: 1 }}
              aria-label="copy"
              onClick={handleCopy}
            >
              <CopyIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default APIKeyManagement;

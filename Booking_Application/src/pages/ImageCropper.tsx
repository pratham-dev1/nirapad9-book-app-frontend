import { createRef, useEffect, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import { Avatar, Box, Typography } from "@mui/material";
import "cropperjs/dist/cropper.css";

import CustomButton from "../components/CustomButton";
import "../styles/ImageCropperStyle.css";

interface ImageCropperProps {
  croppedImage?: string | null;
  setCroppedImage?: (value: string | null) => void;
  closeDialog?:()=>void;
  isProfilePic?: boolean;
  handleProfilePicChange?: any
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  croppedImage,
  setCroppedImage,
  closeDialog,
  isProfilePic,
  handleProfilePicChange
}) => {
  const [image, setImage] = useState<string>("");
  const cropperRef = createRef<ReactCropperElement>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const onChange = (e: any) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as any);
    };
    reader.readAsDataURL(files[0]);
  };

  const save = () => {
            setCroppedImage?.(previewImage);
            closeDialog?.()
            if(isProfilePic) {
              handleProfilePicChange(previewImage)
            }
  };

  // Function to update the live preview while dragging/resizing
  const updatePreview = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();

      if (croppedCanvas) {
        // Generate a circular preview image
        const circleCanvas = document.createElement("canvas");
        const diameter = Math.min(croppedCanvas.width, croppedCanvas.height);
        circleCanvas.width = diameter;
        circleCanvas.height = diameter;

        const context = circleCanvas.getContext("2d");
        if (context) {
          context.beginPath();
          context.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
          context.closePath();
          context.clip();

          context.drawImage(
            croppedCanvas,
            (croppedCanvas.width - diameter) / 2,
            (croppedCanvas.height - diameter) / 2,
            diameter,
            diameter,
            0,
            0,
            diameter,
            diameter
          );
          setPreviewImage(circleCanvas.toDataURL());
        }
      }
    }
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          columnGap: "16px",
          alignItems: "end",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onChange}
          id="profilePictureInput"
        />
        <label htmlFor="profilePictureInput">
          <b className="upload">Upload Image</b>
        </label>

      </Box>

      {image ? (
        <div style={{ width: "100%" }} className={"image-cropper-container"}>
          <div style={{ width: "50%" }}>
            <Cropper
              ref={cropperRef}
              style={{ height: 300, width: "100%" }}
              zoomTo={0.5}
              initialAspectRatio={1}
              src={image}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              guides={true}
              crop={updatePreview}  // Live preview while dragging
            />
          </div>

          {previewImage ? (
        <div
          className="image-copper-preview-box"
          style={{ width: "50%", marginTop: "20px" , marginLeft:'20px'}}
        >
          <Typography variant="h6" gutterBottom>
            Live Preview
          </Typography>

          <Avatar
            src={previewImage}
            sx={{ width: 75, height: 75 }}
            className="uploaded-image-preview"
          />
        </div>
      ) : null}


        </div>
      ) : null}

       {image ? (
        <Box sx={{marginTop:"25px"}}>

          <CustomButton
            label="Save"
            className="primary-btn mr-25"
            variant="outlined"
            onClick={save}
          />
          </Box>
        ) : null}

    </div>
  );
};

export default ImageCropper;

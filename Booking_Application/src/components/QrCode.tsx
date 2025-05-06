import React, { FC, useRef, useState } from 'react';
import {QRCodeSVG} from 'qrcode.react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import QrCode2SharpIcon from '@mui/icons-material/QrCode2Sharp';
import CloseIcon from '@mui/icons-material/Close';
import CustomButton from './CustomButton';

const QRCode: FC<{link: string}> = ({link}) => {
  const qrRef = useRef<any>();
  const [open, setOpen] = useState(false)

  const handleDownload = () => {
    const svgElement = qrRef.current.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'qrcode.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      img.src = url;
    }
  };

  return (
        <div>
          <QrCode2SharpIcon onClick={()=> setOpen(true)} />
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <div className='popup-header'>
              <h2>Tag QR Code</h2>
              <CloseIcon onClick={() => setOpen(false)} />
            </div>
        
            <DialogContent>
              <h2 className='text-center'>Scan this QR Code</h2>
              <div ref={qrRef} className='mb-50 text-center'>
                <QRCodeSVG
                  value={link}
                  size={256}
                  bgColor="#f0f0f0"
                  fgColor="#333333"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="d-flex align-center justify-center mt-20">
                <CustomButton
                  label="Cancel"
                  className="cancel-btn mr-25"
                  variant="outlined"
                  onClick={() => setOpen(false)}
                />
                <CustomButton
                  type="submit"
                  label="Download"
                  className="submit-btn mr-0"
                  onClick={handleDownload}
                />
                
              </div>
            </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRCode;

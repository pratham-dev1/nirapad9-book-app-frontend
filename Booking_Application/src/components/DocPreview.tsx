import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';

const HtmlToImagePreview = ({ htmlContent }: any) => {
  const htmlRef = useRef<any>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (htmlRef.current === null) {
      return;
    }
    toPng(htmlRef.current)
      .then((dataUrl) => {
        setImageUrl(dataUrl);
        if (htmlRef.current) {
          htmlRef.current.style.display = 'none';
        }
      })
      .catch((error) => {
        console.error('Error generating image:', error);
      });
  }, [htmlContent]);

  return (
    <div>
      <div
        ref={htmlRef}
        style={{
          padding: '10px',
          backgroundColor: 'white',
          color: 'black',
          fontSize: '18px',
          width: '600px',
          overflow: 'hidden',
          wordWrap: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      {imageUrl && (
          <img src={imageUrl} alt="HTML Preview" style={{ height: 230, width:200}} />
      )}
    </div>
  );
};

export default HtmlToImagePreview;

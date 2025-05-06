import React, { FC, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type RichTextProps = {
  onChange: () => void;
  value: string
}

const CustomRichTextEditor: FC<RichTextProps> = ({onChange, value}) => {
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ]
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }

  return <ReactQuill style={{height: 300}} theme="snow" value={value} onChange={onChange} formats={formats} modules={modules} />;
}

export default CustomRichTextEditor
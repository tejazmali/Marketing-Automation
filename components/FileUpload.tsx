import React, { useState, useCallback } from 'react';
import Button from './common/Button';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  accept?: string;
  buttonText: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, accept = '.csv', buttonText }) => {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
        dragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-indigo-500'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      <label htmlFor="file-upload" className="cursor-pointer block">
        <p className="text-lg mb-2">
          {fileName ? `File selected: ${fileName}` : `Drag & drop your ${accept.substring(1).toUpperCase()} file here, or`}
        </p>
        <Button variant="secondary" className="mt-2">
          {buttonText}
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;
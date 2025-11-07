import React from 'react';

interface HeaderProps {
  appName: string;
}

const PepoMartLogo: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M24 0C10.745 0 0 10.745 0 24C0 37.255 10.745 48 24 48C37.255 48 48 37.255 48 24C48 10.745 37.255 0 24 0ZM24 4C13.514 4 5 12.514 5 23C5 33.486 13.514 42 24 42C34.486 42 43 33.486 43 23C43 12.514 34.486 4 24 4ZM24.5 13H15V24.5H24.5C28.5284 24.5 31.75 21.2784 31.75 17.25C31.75 13.2216 28.5284 10 24.5 10V13ZM24.5 15C27.4087 15 29.75 17.3413 29.75 20.25C29.75 23.1587 27.4087 25.5 24.5 25.5H15V36H24.5C31.4036 36 37 30.4036 37 23.5C37 16.5964 31.4036 11 24.5 11V15Z" fill="#8B5CF6"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M15 24.5H24.5C27.4087 24.5 29.75 22.1587 29.75 19.25C29.75 16.3413 27.4087 14 24.5 14H15V24.5Z" fill="#4C2B80"/>
  </svg>
);


const Header: React.FC<HeaderProps> = ({ appName }) => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            <PepoMartLogo />
          </div>
          <h1 className="text-2xl font-bold font-mono">
            {appName}
          </h1>
        </div>
        {/* Potentially add navigation or user info here */}
      </div>
    </header>
  );
};

export default Header;
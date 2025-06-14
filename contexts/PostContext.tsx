// contexts/PostContext.tsx
import React, { createContext, useContext, useState } from 'react';

const PostContext = createContext({
  refreshFlag: false,
  triggerRefresh: () => {},
});

export const PostProvider = ({ children }: any) => {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev); // Toggle value to notify listeners
  };

  return (
    <PostContext.Provider value={{ refreshFlag, triggerRefresh }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => useContext(PostContext);

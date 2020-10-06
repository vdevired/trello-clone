import React from 'react';

export default React.createContext({
  user : null,
  checkedAuth: false, // Whether your auth has been checked or not
});
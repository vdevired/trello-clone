import React from 'react';

export default React.createContext({
  authenticated : false,
  checkedAuth: false, // Whether your auth has been checked or not
});
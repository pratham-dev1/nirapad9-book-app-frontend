import React from 'react';
import { useParams } from 'react-router-dom';
import EndUserReports from './reports/EndUserReports';
import ProductOwnerReports from './reports/ProductOwnerReports';
import AddNewTag from './AddNewTag';

const SearchDashboard = () => {
  const { searchId } = useParams<{ searchId: string }>(); 

  const handleSearch = () => {
    switch (searchId) {
      case 'end-user-reports':
        return <EndUserReports value={3} index={3} />; 
      case 'product-owner-reports':
        return <ProductOwnerReports value={3} index={3} />; 
      case 'add-new-tag':
        return <AddNewTag />
      default:
        return <div>No matching search found.</div>; 
    }
  };

  return (
     handleSearch()
  );
};

export default SearchDashboard;

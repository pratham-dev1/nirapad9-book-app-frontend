import { useSearchParams } from 'react-router-dom';

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getQueryParam = (key: string) => {
    return searchParams.get(key);
  };

  const setQueryParam = (params: { [key: string]: string }) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const getAllQueryParams = () => {
    return Object.fromEntries([...searchParams.entries()]);
  };

  return {
    getQueryParam,
    setQueryParam,
    getAllQueryParams,
    searchParams
  };
};

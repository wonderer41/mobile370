import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface Post {
  $id: string;
  id?: number;
  title: string;
  thumbnail: string;
  video: string;
  creator: {
    username: string;
    avatar: string;
  };
}

const useAppwrite = (fn: () => Promise<Post[]>) => {
  const [data, setData] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fn();
      setData(response);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong')
    } finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fn]);

  const refetch = useCallback(() => {
    return fetchData();
  }, []);

  return { data, isLoading, refetch };
}

export default useAppwrite;
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseSupabaseReturn<T> {
  data: T[];
  loading: boolean;
  refetch: () => void;
}

const useSupabase = <T = any>(fn: () => Promise<T[]>): UseSupabaseReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => fetchData();

  return { data, loading, refetch };
};

export default useSupabase;
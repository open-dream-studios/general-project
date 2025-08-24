"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  RefObject,
} from "react";
import {
  useQuery,
  useMutation,
  QueryObserverResult,
  useQueryClient,
} from "@tanstack/react-query";
import { makeRequest } from "@/util/axios";
import { AuthContext } from "./authContext";

export type Product = {
  serial_number: string;
  name: string;
  highlight: string | null;
  description: string | null;
  make: string | null;
  model: string | null;
  price: number;
  date_sold?: Date;
  date_entered?: Date;
  repair_status: "In Progress" | "Complete";
  sale_status:
    | "Not Yet Posted"
    | "Awaiting Sale"
    | "Sold Awaiting Delivery"
    | "Delivered";
  length: number;
  width: number;
  note: string | null;
  images: string[];
  ordinal: number;
};

export type QueryContextType = {
  isOptimisticUpdate: RefObject<boolean>;
  productsData: Product[];
  isLoadingProductsData: boolean;
  refetchProductsData: () => void;
  // refetchProductsData: () => Promise<QueryObserverResult<Product[], Error>>;
  updateProducts: (updatedProducts: Product[]) => void;
  deleteProducts: (serial_numbers: string[]) => void;
};

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);
  const isLoggedIn = useMemo(
    () => !!currentUser?.user_id,
    [currentUser?.user_id]
  );

  const productsData: any[] = [];
  const isLoadingProductsData = false;
  const refetchProductsData = () => {};

  // const {
  //   data: productsData,
  //   isLoading: isLoadingProductsData,
  //   refetch: refetchProductsData,
  // } = useQuery<Product[]>({
  //   queryKey: ["products"],
  //   queryFn: async () => {
  //     const res = await makeRequest.get("/api/products/get", {});
  //     const result = res.data.products || [];
  //     const sorted = result.sort(
  //       (a: Product, b: Product) => (a.ordinal ?? 0) - (b.ordinal ?? 0)
  //     );
  //     // console.log(sorted);
  //     return sorted;
  //   },
  //   staleTime: 1000 * 60 * 5,
  //   gcTime: 1000 * 60 * 10,
  //   refetchOnMount: true,
  //   enabled: isLoggedIn,
  // });

  const updateProductsMutation = useMutation({
    mutationFn: async (products: Product[]) => {
      await makeRequest.post("/api/products/update", {
        products,
      });
    },
    onMutate: async (updatedProducts: Product[]) => {
      const queryKey = ["products"];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<Product[]>(queryKey);
      if (!previousData) return { previousData, queryKey };
      const newData = previousData.map((product) => {
        const updated = updatedProducts.find(
          (p) => p.serial_number === product.serial_number
        );
        return updated ? updated : product;
      });
      queryClient.setQueryData(queryKey, newData);
      isOptimisticUpdate.current = true;
      return { previousData, queryKey };
    },
    onError: (_err, _newData, context) => {
      if (context?.queryKey && context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (_data, _err, _variables, context) => {
      isOptimisticUpdate.current = false;
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  type DeleteContext = {
    previousData: any[] | undefined;
    queryKey: string[];
  };

  const deleteProductsMutation = useMutation<
    void,
    Error,
    string[],
    DeleteContext
  >({
    mutationFn: async (serial_numbers: string[]) => {
      await makeRequest.delete("/api/products/delete", {
        data: { serial_numbers },
      });
    },
    onMutate: async (serial_numbers: string[]) => {
      const queryKey = ["products"];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<any[]>(queryKey);
      if (!previousData) return { previousData, queryKey };

      const newData = previousData.filter(
        (product) => !serial_numbers.includes(product.serial_number)
      );

      queryClient.setQueryData(queryKey, newData);
      return { previousData, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  const updateProducts = async (updatedProducts: Product[]) => {
    await updateProductsMutation.mutateAsync(updatedProducts);
  };

  const deleteProducts = async (serial_numbers: string[]) => {
    await deleteProductsMutation.mutateAsync(serial_numbers);
  };

  const isOptimisticUpdate = useRef(false);

  return (
    <QueryContext.Provider
      value={{
        isOptimisticUpdate,
        productsData: productsData ?? [],
        isLoadingProductsData,
        refetchProductsData,
        updateProducts,
        deleteProducts,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export const useContextQueries = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQueries must be used within a QueryProvider");
  }
  return context;
};

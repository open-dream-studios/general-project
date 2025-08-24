"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  RefObject,
} from "react";
import { getCurrentTimestamp, getNextOrdinal } from "@/util/functions/Data";
import axios from "axios";
import {
  UseFormGetValues,
  UseFormReturn,
  UseFormSetValue,
} from "react-hook-form";
import { ProductFormData } from "@/components/ProductPage/ProductPage";
import { Product, useContextQueries } from "./queryContext";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import Modal2Continue from "@/modals/Modal2Continue";
import { useModal2Store } from "@/store/useModalStore";

type AppContextType = {
  localData: Product[];
  localDataRef: RefObject<Product[]>;
  setLocalData: React.Dispatch<React.SetStateAction<Product[]>>;
  editingLock: boolean;
  setEditingLock: React.Dispatch<React.SetStateAction<boolean>>;
  uploadPopup: boolean;
  setUploadPopup: React.Dispatch<React.SetStateAction<boolean>>;
  handleFiles: (
    files: File[],
    setValue: UseFormSetValue<ProductFormData>,
    getValues: UseFormGetValues<ProductFormData>
  ) => void;
  uploadPopupRef: React.RefObject<HTMLDivElement | null>;
  addProductPage: boolean;
  setAddProductPage: React.Dispatch<React.SetStateAction<boolean>>;
  dataFilters: DataFilters;
  setDataFilters: React.Dispatch<React.SetStateAction<DataFilters>>;
  filteredProducts: (products: Product[]) => Product[];
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  saveProducts: (newProduct?: Product) => Promise<void>;
  productFormRef: React.RefObject<UseFormReturn<ProductFormData> | null>;
  formRefs: React.RefObject<Map<string, UseFormReturn<ProductFormData>>>;
  previousPath: string | null;
  pageClick: (newPage: string) => void;
  onSubmit: (
    data: ProductFormData,
    overrideNewProduct?: boolean
  ) => Promise<boolean>;
  submitProductForm: () => Promise<boolean>;
  resetTimer: (fast: boolean) => void;
  checkForUnsavedChanges: () => boolean;
};

export type FileImage = {
  name: string;
  file: File;
};

export type DataFilters = {
  listings: "All" | "Active" | "Sold";
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { productsData, isOptimisticUpdate } = useContextQueries();
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const lastPathRef = useRef<string | null>(null);
  const router = useRouter();

  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

  const [localData, setLocalDataState] = useState<Product[]>([]);
  const localDataRef = useRef<Product[]>([]);

  const setLocalData: React.Dispatch<React.SetStateAction<Product[]>> = (
    newDataOrFn
  ) => {
    const newData =
      typeof newDataOrFn === "function"
        ? (newDataOrFn as (prev: Product[]) => Product[])(localDataRef.current)
        : newDataOrFn;
    localDataRef.current = newData;
    setLocalDataState(newData);
  };

  useEffect(() => {
    if (!isOptimisticUpdate.current && productsData) {
      setLocalData(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      setPreviousPath(lastPathRef.current);
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  const { updateProducts } = useContextQueries();
  const [editingLock, setEditingLock] = useState<boolean>(false);

  const [uploadPopup, setUploadPopup] = useState(false);
  const uploadPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        uploadPopupRef.current &&
        !uploadPopupRef.current.contains(event.target as Node)
      ) {
        setUploadPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async (files: FileImage[]) => {
    const formData = new FormData();
    files.forEach((fileImage, index) => {
      formData.append("files", fileImage.file, fileImage.name);
    });
    try {
      const response = await axios.post("/api/images/compress", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        const isValidUrl = (url: string) =>
          typeof url === "string" && url.startsWith("https://");
        const cleanUrls = response.data.urls.filter(isValidUrl);
        return cleanUrls;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Upload error:", error);
      return [];
    }
  };

  const handleFileProcessing = async (files: File[]): Promise<string[]> => {
    setEditingLock(true);
    const uploadedNames: string[] = [];
    // const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (files.length === 0) {
      alert("Only image files are allowed!");
      setEditingLock(false);
      return [];
    }

    const readerPromises = files.map((file) => {
      return new Promise<FileImage>((resolve) => {
        const extension = file.type.split("/").pop();
        if (!extension) return;

        const lastDotIndex = file.name.lastIndexOf(".");
        if (lastDotIndex === -1) return;

        const newFileName = file.name.slice(0, lastDotIndex);
        let sanitizedFileName = newFileName.replace(/[^a-zA-Z0-9]/g, "_");
        const extention = file.type.startsWith("image/") ? "webp" : file.name.split(".").pop();
        const timeStamp = getCurrentTimestamp();

        sanitizedFileName = `${timeStamp}--${sanitizedFileName}.${extention}`;
        uploadedNames.push(sanitizedFileName);
        resolve({ name: sanitizedFileName, file });
      });
    });

    try {
      const images = await Promise.all(readerPromises);
      setUploadPopup(false);
      const urls = await handleSend(images);
      return urls;
    } catch (err) {
      console.error("Error processing files:", err);
      return [];
    } finally {
      setEditingLock(false);
    }
  };

  const handleFiles = async (
    files: File[],
    setValue: UseFormSetValue<ProductFormData>,
    getValues: UseFormGetValues<ProductFormData>
  ) => {
    const newImages = await handleFileProcessing(files);
    if (newImages.length === 0) return;
    const currentImages = getValues("images") || [];
    const updated = [...currentImages, ...newImages];
    setValue("images", updated, { shouldDirty: true });
  };

  const [addProductPage, setAddProductPage] = useState<boolean>(false);

  const [dataFilters, setDataFilters] = useState<DataFilters>({
    listings: "All",
  });

  const filteredProducts = (products: Product[]) => {
    if (products.length === 0) return [];
    if (dataFilters.listings === "All") {
      return products;
    } else if (dataFilters.listings === "Sold") {
      return products.filter(
        (product) =>
          product.sale_status === "Sold Awaiting Delivery" ||
          product.sale_status === "Delivered"
      );
    } else {
      return products.filter(
        (product) =>
          product.sale_status === "Not Yet Posted" ||
          product.sale_status === "Awaiting Sale"
      );
    }
  };

  const normalizeProduct = (item: Product) => {
    return {
      ...item,
      date_entered: item.date_entered ?? undefined,
      date_sold: item.date_sold ?? undefined,
      note: item.note ?? "",
      images: Array.isArray(item.images) ? item.images : [],
    };
  };

  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const formRefs = useRef<Map<string, UseFormReturn<ProductFormData>>>(
    new Map()
  );
  type ProductFormRef = React.RefObject<UseFormReturn<ProductFormData> | null>;
  const productFormRef: ProductFormRef = useRef(null);

  const getUnsavedProducts = (): Product[] => {
    const updatedProducts: Product[] = [];
    for (const item of localDataRef.current) {
      const stored = productsData.find(
        (p) => p.serial_number === item.serial_number
      );
      if (stored && stored?.ordinal !== item.ordinal) {
        updatedProducts.push(normalizeProduct(item));
        continue;
      }

      if (formRefs.current) {
        const formArray = formRefs.current
          .entries()
          .find((form) => form[0] === item.serial_number);
        if (formArray) {
          const isDirty =
            Object.keys(formArray[1].formState.dirtyFields).length > 0;
          if (isDirty) {
            updatedProducts.push(normalizeProduct(item));
          }
        }
      }
    }

    return updatedProducts;
  };

  const checkForUnsavedChanges = () => {
    return getUnsavedProducts().length > 0;
  };

  const saveProducts = async (newProduct?: Product) => {
    const updatedProducts = getUnsavedProducts();

    if (newProduct) {
      updatedProducts.push(newProduct);
    }

    if (updatedProducts.length === 0) return;

    cancelTimer();

    try {
      setEditingLock(true);
      await updateProducts(updatedProducts);
      for (const [, form] of formRefs.current.entries()) {
        form.reset(form.getValues());
      }
    } catch (err) {
      toast.error("Failed to update products");
    } finally {
      setEditingLock(false);
    }
  };

  const promptSave = async (onNoSave: () => void, onContinue: () => void) => {
    setModal2({
      ...modal2,
      open: !modal2.open,
      showClose: false,
      offClickClose: true,
      width: "w-[300px]",
      maxWidth: "max-w-[400px]",
      aspectRatio: "aspect-[5/2]",
      borderRadius: "rounded-[12px] md:rounded-[15px]",
      content: (
        <Modal2Continue
          text={`Save products before continuing?`}
          onContinue={onContinue}
          threeOptions={true}
          onNoSave={onNoSave}
        />
      ),
    });
  };

  const pageClick = async (newPage: string) => {
    if (newPage === pathname) return;
    if (pathname === "/") {
      if (checkForUnsavedChanges()) {
        await saveProducts();
      }
      router.push(newPage);
    } else if (pathname.startsWith("/products")) {
      const onContinue = async () => {
        const result = await submitProductForm();
        if (result) {
          router.push(newPage);
        }
      };
      if (pathname === "/products") {
        if (addProductPage) {
          promptSave(() => router.push(newPage), onContinue);
        } else {
          router.push(newPage);
        }
      } else {
        const isDirty = productFormRef?.current?.formState?.isDirty;
        if (isDirty) {
          promptSave(() => router.push(newPage), onContinue);
        } else {
          router.push(newPage);
        }
      }
    } else {
      router.push(newPage);
    }
  };

  const onSubmit = async (
    data: ProductFormData,
    overrideNewProduct?: boolean
  ): Promise<boolean> => {
    try {
      const isNew = overrideNewProduct ?? addProductPage;

      if (data.serial_number.length < 14) {
        toast.error("Serial # is not at least 14 characters");
        return false;
      }

      const existing = productsData.find(
        (item) => item.serial_number === data.serial_number
      );

      if (isNew && existing) {
        toast.error("ID is already used on another product");
        return false;
      }

      const ordinal = existing?.ordinal ?? getNextOrdinal(productsData);
      const normalizedData: Product = {
        ...data,
        highlight: existing?.highlight ?? null,
        description: data.description ?? null,
        note: data.note ?? null,
        images: Array.isArray(data.images) ? data.images : [],
        ordinal,
      };

      await updateProducts([normalizedData]);
      if (productFormRef.current) {
        productFormRef.current.reset(productFormRef.current.watch());
      }

      return true;
    } catch (error) {
      toast.error("Error updating products");
      return false;
    }
  };

  const submitProductForm = async () => {
    const form = productFormRef.current;
    if (!form) return false;
    const data = form.getValues();
    try {
      return await onSubmit(data);
    } catch (err) {
      return false;
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimer = (fast: boolean) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(
      async () => {
        await saveProducts();
      },
      fast ? 200 : 2000
    );
  };

  const resetTimer = (fast: boolean) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    startTimer(fast);
  };

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        localData,
        localDataRef,
        setLocalData,
        editingLock,
        setEditingLock,
        uploadPopup,
        setUploadPopup,
        handleFiles,
        uploadPopupRef,
        addProductPage,
        setAddProductPage,
        dataFilters,
        setDataFilters,
        filteredProducts,
        editMode,
        setEditMode,
        selectedProducts,
        setSelectedProducts,
        saveProducts,
        formRefs,
        productFormRef,
        previousPath,
        pageClick,
        onSubmit,
        submitProductForm,
        resetTimer,
        checkForUnsavedChanges,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
};

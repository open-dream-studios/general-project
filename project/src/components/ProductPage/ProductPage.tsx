"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/authContext";
import React from "react";
import { useAppContext } from "@/contexts/appContext";
import { appTheme } from "@/util/appTheme";
import { useModal1Store, useModal2Store } from "@/store/useModalStore";
import "react-datepicker/dist/react-datepicker.css";
import { useContextQueries } from "@/contexts/queryContext";
import { IoIosAddCircleOutline } from "react-icons/io";
import ProductImages from "@/components/ProductPage/ProductImages";
import { usePathname, useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa6";
import UploadModal from "../Upload/Upload";
import { ProductFormData } from "@/util/schemas/productSchema";
import { useProductForm } from "@/hooks/useProductForm";
import ProductInputField from "../Forms/ProductInputField";
import Modal2Continue from "@/modals/Modal2Continue";

const ProductPage = ({ serialNumber }: { serialNumber?: string }) => {
  const { currentUser } = useContext(AuthContext);
  const {
    setUploadPopup,
    setAddProductPage,
    previousPath,
    productFormRef,
    onSubmit,
    addProductPage: newProduct,
  } = useAppContext();
  const { productsData } = useContextQueries();
  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const router = useRouter();
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);
  const pathname = usePathname();

  const form = useProductForm();
  const dateSold = form.watch("date_sold");
  const dateEntered = form.watch("date_entered");
  const images = form.watch("images");

  useEffect(() => {
    if (productFormRef) {
      productFormRef.current = form;
    }
  }, [form, productFormRef]);

  useEffect(() => {
    if (!newProduct && serialNumber && productsData?.length) {
      const matchedProduct = productsData.find(
        (product) => product.serial_number === serialNumber
      );
      if (!matchedProduct) {
        console.warn("No product found for serial number:", serialNumber);
        return;
      }
      const formDefaults: Partial<ProductFormData> = {
        ...matchedProduct,
        date_sold: matchedProduct.date_sold
          ? new Date(matchedProduct.date_sold)
          : undefined,
        date_entered: matchedProduct.date_entered
          ? new Date(matchedProduct.date_entered)
          : undefined,
        price: matchedProduct.price ? Number(matchedProduct.price) : 0,
        length: matchedProduct.length ? Number(matchedProduct.length) : 0,
        width: matchedProduct.width ? Number(matchedProduct.width) : 0,
      };
      form.reset(formDefaults);
    }
  }, [newProduct, serialNumber, productsData, form.reset]);

  const resetForm = async () => {
    await setModal1({
      ...modal1,
      open: false,
    });
    form.reset();
  };

  if (!currentUser) return null;

  if (!newProduct && serialNumber && productsData?.length) {
    const productExists = productsData.some(
      (p) => p.serial_number === serialNumber
    );
    if (!productExists) {
      return (
        <div
          className="text-center text-xl py-20"
          style={{ color: appTheme[currentUser.theme].text_1 }}
        >
          No product found for serial number: <strong>{serialNumber}</strong>
        </div>
      );
    }
  }

  const goToPrev = () => {
    if (pathname === "/products") {
      form.reset();
      setAddProductPage(false);
    } else if (previousPath) {
      form.reset();
      setAddProductPage(false);
      router.push(previousPath);
    }
  };

  const handleBackButton = () => {
    if (form.formState.isDirty) {
      if (!currentUser) return null;
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
            onContinue={form.handleSubmit(async (data) => {
              await onSubmit(data);
              goToPrev();
            })}
            threeOptions={true}
            onNoSave={() => goToPrev()}
          />
        ),
      });
    } else {
      if (newProduct) {
        setAddProductPage(false);
      } else {
        goToPrev();
      }
    }
  };

  const handleProductsClick = () => {
    if (form.formState.isDirty) {
      if (!currentUser) return null;
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
            onContinue={form.handleSubmit(async (data) => {
              await onSubmit(data);
              router.push("/products");
            })}
            threeOptions={true}
            onNoSave={() => goToPrev()}
          />
        ),
      });
    } else {
      router.push("/products");
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    resetForm();
    goToPrev();
  };

  if (!currentUser) return null;

  return (
    <div className="w-[100%] h-[100%] overflow-scroll">
      <UploadModal setValue={form.setValue} getValues={form.getValues} />
      <div
        className={`max-w-4xl mx-auto px-10 ${
          newProduct ? "pt-[60px]" : "pt-[22px]"
        } pb-[60px] rounded-2xl`}
      >
        <div className="flex flex-row gap-[13px] mb-[10px]">
          <div
            onClick={handleBackButton}
            style={{
              backgroundColor: appTheme[currentUser.theme].background_2,
            }}
            className="w-[40px] h-[40px] rounded-[20px] flex items-center justify-center pr-[2px] pb-[1px] dim hover:brightness-75 cursor-pointer"
          >
            <FaChevronLeft
              size={21}
              color={appTheme[currentUser.theme].text_1}
            />
          </div>

          {newProduct && (
            <div className="">
              <h1 className="text-3xl font-[500] mb-[24px]">Add Product</h1>
            </div>
          )}

          {!newProduct && (
            <div
              className="ml-[2px] flex flex-row gap-[10px] text-[25px] font-[400] mb-[20px] opacity-[0.5]"
              style={{ color: currentUser.theme === "dark" ? "#bbb" : "black" }}
            >
              <div
                onClick={handleProductsClick}
                className="cursor-pointer dim hover:brightness-75"
              >
                Products
              </div>

              <h1 className="hidden [@media(min-width:480px)]:block">/</h1>

              <div className="hidden [@media(min-width:480px)]:block cursor-pointer dim hover:brightness-75 text-[23px] mt-[1px]">
                {serialNumber}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setUploadPopup(true);
          }}
          className="dim hover:brightness-75 cursor-pointer w-[170px] h-[35px] mb-[13px] gap-[6px] rounded-[6px] text-[15px] flex items-center justify-center font-[500]"
          style={{
            border: `0.5px solid ${
              currentUser.theme === "light"
                ? appTheme[currentUser.theme].text_1
                : appTheme[currentUser.theme].text_4
            }`,
          }}
        >
          <IoIosAddCircleOutline
            className="w-[19px] h-[19px] mt-[1px]"
            color={appTheme[currentUser.theme].text_1}
          />
          Images
        </button>

        <ProductImages
          images={images ?? []}
          setValue={form.setValue}
          getValues={form.getValues}
        />

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="gap-[10px] mt-[10px]"
        >
          <ProductInputField
            label="Name"
            name="name"
            register={form.register}
            error={form.formState.errors.name?.message}
            disabled={false}
            className="w-[100%] mb-[10px]"
            inputType={"input"}
          />

          <ProductInputField
            label="Description"
            name="description"
            register={form.register}
            error={form.formState.errors.description?.message}
            disabled={false}
            className="w-[100%] mb-[10px]"
            inputType={"textarea"}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-[10px] gap-x-[5vw]">
            <ProductInputField
              label="Serial Number"
              name="serial_number"
              register={form.register}
              error={form.formState.errors.serial_number?.message}
              disabled={!newProduct}
              className="col-span-2 sm:col-span-1"
              inputType={"input"}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 20);
              }}
            />

            <ProductInputField
              label="Price ($)"
              name="price"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              inputType={"input"}
              onInput={(e) => {
                let value = e.currentTarget.value;
                value = value.replace(/[^0-9.]/g, "");
                const parts = value.split(".");
                if (parts.length > 2) value = parts[0] + "." + parts[1];
                if (parts[1]?.length > 2) {
                  parts[1] = parts[1].slice(0, 2);
                  value = parts[0] + "." + parts[1];
                }
                e.currentTarget.value = value;
              }}
              register={form.register}
              registerOptions={{
                required: "Price is required",
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places",
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              }}
              error={form.formState.errors.price?.message}
              className="col-span-2 sm:col-span-1"
            />

            <ProductInputField
              label="Make"
              name="make"
              register={form.register}
              error={form.formState.errors.make?.message}
              className="col-span-2 sm:col-span-1"
              inputType={"input"}
            />

            <ProductInputField
              label="Model"
              name="model"
              register={form.register}
              error={form.formState.errors.model?.message}
              className="col-span-2 sm:col-span-1"
              inputType={"input"}
            />

            <ProductInputField
              label="Repair Status"
              name="repair_status"
              register={form.register}
              className="col-span-2 sm:col-span-1"
              inputType={"dropdown"}
              options={["In Progress", "Complete"]}
            />

            <ProductInputField
              label="Sale Status"
              name="sale_status"
              register={form.register}
              className="col-span-2 sm:col-span-1"
              inputType={"dropdown"}
              options={[
                "Not Yet Posted",
                "Awaiting Sale",
                "Sold Awaiting Delivery",
                "Delivered",
              ]}
            />

            <ProductInputField
              label="Length (in)"
              name="length"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              inputType={"input"}
              onInput={(e) => {
                let value = e.currentTarget.value;
                value = value.replace(/[^0-9.]/g, "");
                const parts = value.split(".");
                if (parts.length > 2) {
                  value = parts[0] + "." + parts[1];
                }
                if (parts[1]?.length > 2) {
                  parts[1] = parts[1].slice(0, 2);
                  value = parts[0] + "." + parts[1];
                }
                e.currentTarget.value = value;
              }}
              register={form.register}
              registerOptions={{
                required: "Length is required",
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places",
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              }}
              error={form.formState.errors.length?.message}
              className="col-span-2 sm:col-span-1"
            />

            <ProductInputField
              label="Width (in)"
              name="width"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              inputType={"input"}
              onInput={(e) => {
                let value = e.currentTarget.value;
                value = value.replace(/[^0-9.]/g, "");
                const parts = value.split(".");
                if (parts.length > 2) {
                  value = parts[0] + "." + parts[1];
                }
                if (parts[1]?.length > 2) {
                  parts[1] = parts[1].slice(0, 2);
                  value = parts[0] + "." + parts[1];
                }
                e.currentTarget.value = value;
              }}
              register={form.register}
              registerOptions={{
                required: "Width is required",
                validate: (value) =>
                  /^\d+(\.\d{1,2})?$/.test(String(value)) ||
                  "Max 2 decimal places",
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              }}
              error={form.formState.errors.width?.message}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          <div className="flex flex-row">
            {!newProduct && (
              <div className="mr-[25px] pointer-events-none">
                <ProductInputField
                  label="Date Entered"
                  name="date_entered"
                  register={form.register}
                  className="mt-[12px] opacity-[0.5]"
                  inputType={"date"}
                  selected={dateEntered}
                  disabled={true}
                  onChange={(date: Date | null) =>
                    form.setValue("date_entered", date ?? undefined, {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
            )}

            <ProductInputField
              label="Date Sold"
              name="date_sold"
              register={form.register}
              className="mt-[12px]"
              inputType={"date"}
              selected={dateSold}
              disabled={false}
              onChange={(date: Date | null) =>
                form.setValue("date_sold", date ?? undefined, {
                  shouldDirty: true,
                })
              }
              onCancel={() => {
                form.setValue("date_sold", undefined, {
                  shouldDirty: true,
                });
              }}
            />
          </div>

          <ProductInputField
            label="Note"
            name="note"
            register={form.register}
            error={form.formState.errors.note?.message}
            disabled={false}
            className="w-[100%] mt-[10px] mb-[10px]"
            inputType={"textarea"}
            rows={2}
          />

          <div className="flex flex-row gap-[16px]">
            {form.formState.isDirty && (
              <button
                type="submit"
                className="cursor-pointer dim hover:brightness-75 mt-[20px] w-[200px] h-[40px] rounded-[8px] text-white font-semibold"
                style={{
                  backgroundColor: appTheme[currentUser.theme].app_color_1,
                }}
              >
                <div className="flex items-center justify-center">Submit</div>
              </button>
            )}

            <div
              onClick={handleBackButton}
              className="cursor-pointer dim hover:brightness-75 mt-[20px] w-[200px] h-[40px] rounded-[8px] text-white font-semibold flex items-center justify-center"
              style={{
                backgroundColor: currentUser.theme === "dark" ? "#999" : "#bbb",
              }}
            >
              Cancel
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export type { ProductFormData };
export default ProductPage;

"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import lottie from "lottie-web";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { BsQuestion } from "react-icons/bs";
import { IoEyeOff } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import appDetails from "../../../util/appDetails.json";
import { appTheme, ThemeType } from "../../../util/appTheme";
import animationData from "../../../util/animations/loading-animation-black.json";
import { useModal1Store, useModal2Store } from "../../../store/useModalStore";
import TermsDocument from "../../../util/forms/TermsDocument";
import PrivacyDocument from "../../../util/forms/PrivacyDocument";
import Modal2Warning from "../../../modals/Modal2Close";
import { validateEmail } from "../../../util/functions/Data";
import { useRouter } from "next/navigation";
import { googleSignIn, login, register } from "@/util/auth";
import { useQueryClient } from "@tanstack/react-query";

const LoginSlider = () => {
  const images = [
    "https://res.cloudinary.com/dlzspcvgq/image/upload/v1755917736/1_ufsrz3.png",
    "https://res.cloudinary.com/dlzspcvgq/image/upload/v1755917736/2_o7xvvb.png",
    "https://res.cloudinary.com/dlzspcvgq/image/upload/v1755917736/3_h4kojt.jpg",
  ];

  images.push(images[0]);
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => prevIndex + 1);
    }, 3900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (index === images.length - 1) {
      setTimeout(() => {
        setIsAnimating(false);
        setIndex(0);
      }, 1000);
    } else {
      setIsAnimating(true);
    }
  }, [index, images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        className="flex w-full h-full"
        initial={{ x: "0%" }}
        animate={{ x: `${-100 * index}%` }}
        transition={
          isAnimating
            ? { duration: 0.8, ease: [0.3, 0.1, 0.15, 0.95] }
            : { duration: 0 }
        }
        style={{ width: `100%` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
            style={{ width: "100%" }}
          />
        ))}
      </motion.div>
      <div className="absolute bottom-[12px] w-full  h-[10px] justify-center items-center flex gap-[14px]">
        <div
          className={`h-[9px] bg-white ${
            index === 0 || index === 3 ? "w-[34px]" : "w-[9px] brightness-[60%]"
          } rounded-full`}
          style={{
            transition: "width 0.5s ease-in-out, filter 0.5s ease-in-out",
          }}
        ></div>
        <div
          className={`h-[9px] bg-white ${
            index === 1 ? "w-[34px]" : "w-[9px] brightness-[60%]"
          } rounded-full`}
          style={{
            transition: "width 0.5s ease-in-out, filter 0.5s ease-in-out",
          }}
        ></div>
        <div
          className={`h-[9px] bg-white ${
            index === 2 ? "w-[34px]" : "w-[9px] brightness-[60%]"
          } rounded-full`}
          style={{
            transition: "width 0.5s ease-in-out, filter 0.5s ease-in-out",
          }}
        ></div>
      </div>
    </div>
  );
};

const Login = () => {
  const queryClient = useQueryClient();
  const defaultTheme = appDetails.default_theme as ThemeType;
  const router = useRouter();
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const modal1 = useModal1Store((state: any) => state.modal1);
  const setModal1 = useModal1Store((state: any) => state.setModal1);
  const modal2 = useModal2Store((state: any) => state.modal2);
  const setModal2 = useModal2Store((state: any) => state.setModal2);

  const [signUpPage, setSignUpPage] = useState<boolean>(false);
  type TermsVisibleType = "terms" | "privacy" | null;
  const [documentVisible, setDocumentVisible] =
    useState<TermsVisibleType>(null);
  const [showDocument, setShowDocument] = useState<boolean>(false);
  const [hideDocument, setHideDocument] = useState<boolean>(false);

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [signInButtonText, setSignInButtonText] = useState<string>("Continue");
  const [nameInputVisible, setNameInputVisible] = useState<boolean>(false);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const questionButtonRef = useRef<HTMLDivElement>(null);
  const passwordVisibleRef = useRef<HTMLDivElement>(null);
  const registerTitleRef = useRef<HTMLParagraphElement>(null);

  const handleEmailInputChange = (e: any) => {
    if (e.target.value.trim().length > 0 && !passwordVisible) {
      setPasswordVisible(true);
      setTimeout(() => {
        if (passwordInputRef.current) {
          passwordInputRef.current.style.transition = "none";
        }
      }, 1000);
    }
  };

  const handleQuestionClick = () => {
    const ForgotPasswordForm = ({
      defaultTheme,
    }: {
      defaultTheme: ThemeType;
    }) => {
      const [forgotPasswordEmail, setForgotPasswordEmail] =
        useState<string>("");
      const [errorText, setErrorText] = useState<string>(
        "Please close out and try again"
      );
      const [codeInput, setCodeInput] = useState<string[]>([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      const [showUpdatePassword, setShowUpdatePassword] =
        useState<boolean>(false);
      const [updatedPassword, setUpdatedPassword] = useState<string>("");
      const [accessToken, setAccessToken] = useState<string>("");
      const [forgotPasswordPage, setForgotPasswordPage] = useState<number>(0);
      const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

      const executeForgotPassword = async () => {
        if (!validateEmail(forgotPasswordEmail.trim().toLowerCase())) {
          setForgotPasswordPage(-1);
          setErrorText("Please enter a valid email");
          return;
        }
        try {
          const response = await fetch("/api/auth/send-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: forgotPasswordEmail.trim().toLowerCase(),
            }),
          });
          const responseData = await response.json();

          if (responseData.success) {
            setForgotPasswordPage(1);
          } else {
            setForgotPasswordPage(-1);
            if (response.status === 404) {
              setErrorText("No account found under this email");
            } else if (
              responseData.message === "google" ||
              responseData.message === "facebook" ||
              responseData.message === "discord"
            ) {
              setErrorText(
                "This email is connected to an existing " +
                  responseData.message +
                  " account"
              );
            }
          }
        } catch (error) {
          console.error("Error sending reset code:", error);
          setForgotPasswordPage(-1);
        }
      };

      const executeCodeEntered = async () => {
        try {
          const response = await fetch("/api/auth/check-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: forgotPasswordEmail.trim().toLowerCase(),
              code: codeInput.join(""),
            }),
          });
          const responseData = await response.json();

          if (responseData.success && responseData.accessToken.length > 0) {
            setForgotPasswordPage(2);
            setAccessToken(responseData.accessToken);
          } else {
            setForgotPasswordPage(-1);
            if (response.status === 404) {
              setErrorText("No account found under this email");
            } else if (
              responseData.message === "google" ||
              responseData.message === "facebook" ||
              responseData.message === "discord"
            ) {
              setErrorText(
                "This email is connected to an existing " +
                  responseData.message +
                  " account"
              );
            }
          }
        } catch (error) {
          console.error("Error checking reset code:", error);
          setForgotPasswordPage(-1);
        }
      };

      const confirmNewPassword = async () => {
        try {
          const response = await fetch(
            "/api/auth/password-reset",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: forgotPasswordEmail.trim().toLowerCase(),
                password: updatedPassword,
                accessToken: accessToken,
              }),
            }
          );
          const responseData = await response.json();

          if (responseData.success) {
            setForgotPasswordPage(3);
          } else {
            setForgotPasswordPage(-1);
            if (response.status === 404) {
              setErrorText("No account found under this email");
            } else if (
              responseData.message === "google" ||
              responseData.message === "facebook" ||
              responseData.message === "discord"
            ) {
              setErrorText(
                "This email is connected to an existing " +
                  responseData.message +
                  " account"
              );
            }
          }
        } catch (error) {
          console.error("Error updating password:", error);
          setForgotPasswordPage(-1);
        }
      };

      const cancelModal = () => {
        setAccessToken("");
        setModal2({
          ...Object.fromEntries(
            Object.entries(modal2).filter(([key]) => key !== "content")
          ),
          open: false,
        });
      };

      return (
        <div className="pt-[10px] w-full h-full flex items-center justify-center flex-col gap-[10px]">
          {forgotPasswordPage === 0 && (
            <>
              <div
                style={{ color: appTheme[defaultTheme].text_1 }}
                className="text-center text-[16px] leading-[16px] font-[500]"
              >
                Forgot your password?
              </div>

              <div
                style={{ color: appTheme[defaultTheme].text_3 }}
                className="mt-[1px] text-center font-[400] text-[14px] leading-[14px]"
              >
                We&lsquo;ll help you get logged back in
              </div>

              <input
                className={`dim w-[calc(100%-50px)] mx-[25px] text-[15px] mt-[3px] px-[17px] items-center justify-center h-[50px] md:h-[46px] lg:h-[50px] rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
                style={{
                  backgroundColor: appTheme[defaultTheme].background_3,
                }}
                type="text"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e: any) => {
                  setForgotPasswordEmail(e.target.value.trim());
                }}
                name="forgotPasswordEmail"
                autoComplete="off"
              />

              <div className="w-full h-[40px] px-[25px] flex flex-row gap-[10px]">
                <div
                  className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
                  style={{
                    color: appTheme[defaultTheme].text_1,
                    backgroundColor: appTheme[defaultTheme].background_2_2,
                  }}
                  onClick={cancelModal}
                >
                  Cancel
                </div>
                <div
                  className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
                  style={{
                    color: appTheme[defaultTheme].background_1_2,
                    backgroundColor: appTheme[defaultTheme].text_3,
                  }}
                  onClick={executeForgotPassword}
                >
                  Send Code
                </div>
              </div>
            </>
          )}
          {forgotPasswordPage === 1 && (
            <>
              <div
                style={{ color: appTheme[defaultTheme].text_1 }}
                className="text-center text-[16px] leading-[16px] font-[500]"
              >
                We sent you an email!
              </div>

              <div
                style={{ color: appTheme[defaultTheme].text_3 }}
                className="mt-[1px] text-center font-[400] text-[14px] leading-[14px]"
              >
                Check your inbox to find your reset code
              </div>

              <div className="w-[calc(100%-50px)] mx-[25px] mb-[7px] h-[50px] flex flex-row gap-[6px] items-center justify-center">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    className={`dim w-[40px] h-[50px] pb-[5px] text-[21px] pl-[13px] mt-[3px] justify-center rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
                    style={{
                      backgroundColor: appTheme[defaultTheme].background_3,
                    }}
                    type="text"
                    value={codeInput[index]}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        codeInput[index] === "" &&
                        index > 0
                      ) {
                        const codeInputCopy = [...codeInput];
                        codeInputCopy[index - 1] = "";
                        setCodeInput(codeInputCopy);
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                    onChange={(e: any) => {
                      const inputValue = e.target.value;
                      if (
                        !isNaN(inputValue) &&
                        inputValue.length <= 1 &&
                        inputValue !== " "
                      ) {
                        const codeInputCopy = [...codeInput];
                        codeInputCopy[index] = inputValue;
                        setCodeInput(codeInputCopy);
                        if (inputValue && index < 5) {
                          inputRefs.current[index + 1]?.focus();
                        }
                      }
                    }}
                    name="forgotPasswordEmail"
                    autoComplete="off"
                  />
                ))}
              </div>

              <div className="w-full h-[40px] px-[25px] flex flex-row gap-[10px]">
                <div
                  className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
                  style={{
                    color: appTheme[defaultTheme].text_1,
                    backgroundColor: appTheme[defaultTheme].background_2_2,
                  }}
                  onClick={cancelModal}
                >
                  Cancel
                </div>
                <div
                  className={`select-none dim ${
                    codeInput.filter((item: string) => item === "").length === 0
                      ? "hover:brightness-75 cursor-pointer"
                      : "cursor-default brightness-[60%]"
                  } flex-1 h-full rounded-[10px] flex items-center justify-center`}
                  style={{
                    color: appTheme[defaultTheme].background_1_2,
                    backgroundColor: appTheme[defaultTheme].text_3,
                  }}
                  onClick={() => {
                    if (
                      codeInput.filter((item: string) => item === "").length ===
                      0
                    ) {
                      executeCodeEntered();
                    }
                  }}
                >
                  Continue
                </div>
              </div>
            </>
          )}
          {forgotPasswordPage === 2 && (
            <>
              <div
                style={{ color: appTheme[defaultTheme].text_1 }}
                className="text-center text-[16px] leading-[16px] font-[500]"
              >
                Your account password can now be reset!
              </div>

              <div
                style={{ color: appTheme[defaultTheme].text_3 }}
                className="mt-[1px] text-center font-[400] text-[14px] leading-[14px]"
              >
                Please enter a new password below
              </div>

              <input
                className={`dim w-[calc(100%-50px)] pr-[40px] h-[45px] mt-[6px] text-[15px] px-[17px] items-center justify-center rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
                style={{
                  backgroundColor: appTheme[defaultTheme].background_3,
                }}
                type={showUpdatePassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e: any) => {
                  setUpdatedPassword(e.target.value);
                }}
                name="password"
                autoComplete="off"
              />
              <div
                onClick={() => {
                  setShowUpdatePassword((prev: boolean) => !prev);
                }}
                className={`brightness-90 cursor-pointer dim hover:brightness-75 select-none absolute top-[101px] right-[40px] rounded-full`}
                title={showUpdatePassword ? "Hide password" : "Show password"}
              >
                {showUpdatePassword ? (
                  <IoEyeOff color={appTheme[defaultTheme].text_2} size={16} />
                ) : (
                  <IoEye color={appTheme[defaultTheme].text_2} size={16} />
                )}
              </div>

              <div className="w-full h-[40px] px-[25px] flex flex-row gap-[10px]">
                <div
                  className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
                  style={{
                    color: appTheme[defaultTheme].text_1,
                    backgroundColor: appTheme[defaultTheme].background_2_2,
                  }}
                  onClick={cancelModal}
                >
                  Cancel
                </div>
                <div
                  className="select-none dim hover:brightness-75 cursor-pointer flex-1 h-full rounded-[10px] flex items-center justify-center"
                  style={{
                    color: appTheme[defaultTheme].background_1_2,
                    backgroundColor: appTheme[defaultTheme].text_3,
                  }}
                  onClick={confirmNewPassword}
                >
                  Confirm
                </div>
              </div>
            </>
          )}
          {forgotPasswordPage === 3 && (
            <>
              <div
                style={{ color: appTheme[defaultTheme].text_1 }}
                className="text-center text-[16px] leading-[16px] font-[500]"
              >
                Password has been updated!
              </div>

              <div
                style={{ color: appTheme[defaultTheme].text_3 }}
                className="mt-[1px] text-center font-[400] text-[14px] leading-[14px]"
              >
                You can now sign in with your new password
              </div>
              <div
                className="mt-[12px] w-[130px] h-[40px] select-none dim hover:brightness-75 cursor-pointer rounded-[10px] flex items-center justify-center"
                style={{
                  color: appTheme[defaultTheme].background_1_2,
                  backgroundColor: appTheme[defaultTheme].text_3,
                }}
                onClick={cancelModal}
              >
                Close
              </div>
            </>
          )}
          {forgotPasswordPage === -1 && (
            <>
              <div
                style={{ color: appTheme[defaultTheme].text_1 }}
                className="text-center text-[16px] leading-[16px] font-[500]"
              >
                Looks like there was an issue
              </div>

              <div
                style={{ color: appTheme[defaultTheme].text_3 }}
                className="mt-[1px] px-[50px] text-center font-[400] text-[14px] leading-[17px]"
              >
                {errorText}
              </div>
              <div
                className="mt-[12px] w-[130px] h-[40px] select-none dim hover:brightness-75 cursor-pointer rounded-[10px] flex items-center justify-center"
                style={{
                  color: appTheme[defaultTheme].background_1_2,
                  backgroundColor: appTheme[defaultTheme].text_3,
                }}
                onClick={cancelModal}
              >
                Close
              </div>
            </>
          )}
        </div>
      );
    };

    setModal2({
      ...modal2,
      open: true,
      showClose: false,
      offClickClose: false,
      width: "w-[400px]",
      maxWidth: "max-w-[400px]",
      aspectRatio: "aspect-[5/2.5]",
      borderRadius: "rounded-[12px] md:rounded-[15px]",
      content: <ForgotPasswordForm defaultTheme={defaultTheme} />,
    });
  };

  let animationInstance: any;
  let containerRef = useRef<HTMLDivElement>(null)
  
  function playAnimation1() {
    // if (containerRef.current) {
    //   animationInstance = lottie.loadAnimation({
    //     container: containerRef.current,
    //     animationData: animationData,
    //     renderer: "svg",
    //     loop: true,
    //     autoplay: true,
    //   });
    // }
  }

  const [continueDisabled, setContinueDisabled] = useState<boolean>(false);
  const handleContinueClick = async (e: any) => {
    if (continueDisabled) return;
    e.preventDefault();
    if (signInButtonText === "Continue") {
      if (signUpPage) {
        if (
          inputs.email !== "" &&
          inputs.password !== "" &&
          inputs.first_name !== "" &&
          inputs.last_name !== ""
        ) {
          if (!validateEmail(inputs.email.trim().toLowerCase())) {
            setModal2({
              ...modal2,
              open: !modal2.open,
              showClose: false,
              offClickClose: true,
              width: "w-[400px]",
              maxWidth: "max-w-[400px]",
              aspectRatio: "aspect-[5/2]",
              borderRadius: "rounded-[12px] md:rounded-[15px]",
              content: <Modal2Warning text={"Please enter a valid email"} />,
            });
            return;
          }
          // Register
          setSignInButtonText("Registering...");
          playAnimation1();
          try {
            setContinueDisabled(true);
            const success = await register(inputs);
            setModal1({
              ...modal1,
              open: false,
            });
            if (success) {
              router.push("/");
              window.location.href = "/";
            }
          } finally {
            if (animationInstance) {
              animationInstance.stop();
            }
            setSignInButtonText("Continue");
            setContinueDisabled(false);
          }
        }
      } else {
        // Login
        if (inputs.email !== "" && inputs.password !== "") {
          setSignInButtonText("Signing In...");
          playAnimation1();
          try {
            setContinueDisabled(true);
            const success = await login(inputs);
            setModal1({
              ...modal1,
              open: false,
            });
            if (success) {
              router.push("/");
              window.location.href = "/";
            }
          } finally {
            if (animationInstance) {
              animationInstance.stop();
            }
            setSignInButtonText("Continue");
            setContinueDisabled(false);
          }
        }
      }
    }
  };

  const [isDisabled, setIsDisabled] = useState(false);
  const triggerSignUpPage = () => {
    if (isDisabled) return;
    setIsDisabled(true);
    setNameInputVisible(!signUpPage);
    if (registerTitleRef.current) {
      registerTitleRef.current.style.transition =
        "opacity 0.6s ease-in-out, margin-top 0.6s ease-in-out, margin-bottom 0.6s ease-in-out";
    }
    if (firstNameInputRef.current) {
      firstNameInputRef.current.style.transition =
        "height 0.7s ease-in-out, margin-bottom 0.7s ease-in-out, opacity 0.5s ease-in-out";
    }
    if (lastNameInputRef.current) {
      lastNameInputRef.current.style.transition =
        "height 0.7s ease-in-out, margin-bottom 0.7s ease-in-out, opacity 0.5s ease-in-out";
    }
    if (passwordVisible) {
      if (passwordVisibleRef.current) {
        passwordVisibleRef.current.style.transition =
          "opacity 0.9s ease-in-out, bottom 0.6s ease-in-out";
      }
      if (questionButtonRef.current) {
        questionButtonRef.current.style.transition =
          "opacity 0.9s ease-in-out, top 0.6s ease-in-out";
      }
    }

    setTimeout(() => {
      setSignUpPage((prev: boolean) => !prev);
    }, 600);
    setTimeout(() => {
      setIsDisabled(false);
      if (registerTitleRef.current) {
        registerTitleRef.current.style.transition = "none";
      }
      if (firstNameInputRef.current) {
        firstNameInputRef.current.style.transition = "none";
      }
      if (lastNameInputRef.current) {
        lastNameInputRef.current.style.transition = "none";
      }
      if (passwordVisible) {
        if (questionButtonRef.current) {
          questionButtonRef.current.style.transition = "none";
        }
        if (passwordVisibleRef.current) {
          passwordVisibleRef.current.style.transition = "none";
        }
      }
    }, 1000);
  };

  return (
    <div
      className="select-none w-full h-full flex flex-row gap-[5px] p-[8px] pointer-events-none"
      style={{ backgroundColor: appTheme[defaultTheme].background_stark }}
    >
      <div className="hidden md:flex flex-1 mb-[3px] overflow-hidden rounded-[14px]">
        <LoginSlider />
      </div>
      <div className="select-auto mt-[50px] pb-[80px] pointer-events-auto relative flex-1 flex flex-col items-center justify-center">
        <div
          className="pb-[11px] mb-[20px] sm:mb-[25px] md:mb-[18px] lg:mb-[25px] text-[calc(3vw+21px)] sm:text-[calc(2.5vw+21px)] md:text-[calc(1.3vw+21px)] leading-[calc(3vw+20px)] sm:leading-[calc(2vw+20px)] md:leading-[calc(1.4vw+20px)] font-[600] text-center px-[15px]"
          style={{
            color: appTheme[defaultTheme].text_1,
          }}
        >
          Welcome SAV :)
        </div>

        <div className="flex w-full flex-row gap-[11px] px-[80px] md:px-[40px]">
          <div
            onClick={async () => {
              const success = await googleSignIn();
              setModal1({
                ...modal1,
                open: false,
              });
              if (success) {
                router.push("/");
                window.location.href = "/";
              }
            }}
            className="relative h-[50px] md:h-[46px] lg:h-[50px] w-full cursor-pointer select-none rounded-[12px] overflow-hidden"
          >
            <div
              className="dim w-full h-full absolute brightness-75 hover:brightness-100"
              style={{
                backgroundColor: appTheme[defaultTheme].background_3,
              }}
            ></div>
            <div className="w-full h-full absolute pointer-events-none flex items-center justify-center gap-[11px]">
              <FcGoogle className="w-[23px] h-[23px]" />
              <div
                className="font-[600] leading-[15px] text-[15px] brightness-90"
                style={{ color: appTheme[defaultTheme].text_2 }}
              >
                Continue with Google
              </div>
            </div>
          </div>
          {/* <div className="relative h-[50px] md:h-[46px] lg:h-[50px] w-full cursor-pointer select-none rounded-[12px] overflow-hidden">
            <div
              className="dim w-full h-full absolute brightness-75 hover:brightness-100"
              style={{
                backgroundColor: appTheme[defaultTheme].background_3,
              }}
            ></div>
            <div className="w-full h-full absolute pointer-events-none flex items-center justify-center">
              <FaFacebook color="#3975EA" className="w-[22px] h-[22px]" />
            </div>
          </div>
          <div className="relative h-[50px] md:h-[46px] lg:h-[50px] w-full cursor-pointer select-none rounded-[12px] overflow-hidden">
            <div
              className="dim w-full h-full absolute brightness-75 hover:brightness-100"
              style={{
                backgroundColor: appTheme[defaultTheme].background_3,
              }}
            ></div>
            <div className="w-full h-full absolute pointer-events-none flex items-center justify-center">
              <FaDiscord color="#606AEC" className="w-[24px] h-[24px]" />
            </div>
          </div> */}
        </div>

        <div className="flex flex-row mt-[19px] gap-[15px]">
          <div
            className="h-[1px] w-[115px] mt-[12px]"
            style={{ backgroundColor: appTheme[defaultTheme].background_2 }}
          ></div>
          <p
            className="text-[17px] brightness-90"
            style={{
              color: appTheme[defaultTheme].text_2,
            }}
          >
            or
          </p>
          <div
            className="h-[1px] w-[115px] mt-[12px]"
            style={{ backgroundColor: appTheme[defaultTheme].background_2 }}
          ></div>
        </div>

        <div className="relative w-full flex flex-col px-[40px] mt-[14px] md:mt-[8px] lg:mt-[14px]">
          <p
            ref={registerTitleRef}
            className={`${
              (signUpPage && nameInputVisible) ||
              (!signUpPage && !nameInputVisible)
                ? "opacity-100"
                : "opacity-0"
            } ${!nameInputVisible && "mb-[7px] mt-0"} ${
              !signUpPage && "text-[15px] font-[400] text-left"
            }
            ${nameInputVisible && "mb-[14px] mt-[2px]"} ${
              signUpPage && "text-[16px] font-[400] text-center"
            } brightness-90`}
            style={{
              color: appTheme[defaultTheme].text_2,
              transition:
                "opacity 0.6s ease-in-out, margin-top 0.6s ease-in-out, margin-bottom 0.6s ease-in-out",
            }}
          >
            {signUpPage ? "Create an account" : "Email Address"}
          </p>
          <div className="flex flex-row gap-[11px]">
            <input
              ref={firstNameInputRef}
              className={`dim ${
                inputs.first_name.length === 0
                  ? "hover:brightness-100 focus:brightness-100 brightness-75"
                  : ""
              } ${
                nameInputVisible
                  ? "opacity-100 h-[50px] md:h-[46px] lg:h-[50px] mb-[11px]"
                  : "h-0 opacity-0 mb-0"
              } w-[calc((100%-11px)/2)] text-[15px] px-[17px] items-center justify-center rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
              style={{
                transition:
                  "height 0.7s ease-in-out, margin-bottom 0.7s ease-in-out, opacity 0.5s ease-in-out",
                transitionDelay: nameInputVisible
                  ? "0s, 0s, 0.4s"
                  : "0.1s, 0.1s, 0s",
                backgroundColor: appTheme[defaultTheme].background_3,
              }}
              type="text"
              placeholder="First name"
              value={inputs.first_name}
              onChange={(e: any) => {
                setInputs((prev) => ({
                  ...prev,
                  first_name: e.target.value.trim(),
                }));
              }}
              name="first_name"
              autoComplete="off"
            />
            <input
              ref={lastNameInputRef}
              className={`dim ${
                inputs.last_name.length === 0
                  ? "hover:brightness-100 focus:brightness-100 brightness-75"
                  : ""
              } ${
                nameInputVisible
                  ? "opacity-100 h-[50px] md:h-[46px] lg:h-[50px] mb-[11px]"
                  : "h-0 opacity-0 mb-0"
              } w-[calc((100%-11px)/2)] text-[15px] px-[17px] items-center justify-center rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
              style={{
                transition:
                  "height 0.7s ease-in-out, margin-bottom 0.7s ease-in-out, opacity 0.5s ease-in-out",
                transitionDelay: nameInputVisible
                  ? "0s, 0s, 0.4s"
                  : "0.1s, 0.1s, 0s",
                backgroundColor: appTheme[defaultTheme].background_3,
              }}
              type="text"
              placeholder="Last name"
              value={inputs.last_name}
              onChange={(e: any) => {
                setInputs((prev) => ({
                  ...prev,
                  last_name: e.target.value.trim(),
                }));
              }}
              name="last_name"
              autoComplete="off"
            />
          </div>
          <input
            className={`dim ${
              inputs.email.length === 0
                ? "hover:brightness-100 focus:brightness-100 brightness-75"
                : ""
            } text-[15px] px-[17px] items-center justify-center h-[50px] md:h-[46px] lg:h-[50px] rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
            style={{
              backgroundColor: appTheme[defaultTheme].background_3,
            }}
            type="text"
            placeholder="Enter your email"
            value={inputs.email}
            onChange={(e: any) => {
              handleEmailInputChange(e);
              setInputs((prev) => ({
                ...prev,
                email: e.target.value.trim().toLowerCase(),
              }));
            }}
            name="email"
            autoComplete="off"
          />
          <input
            ref={passwordInputRef}
            className={`dim pr-[40px] ${
              inputs.password.length === 0
                ? "hover:brightness-100 focus:brightness-100 brightness-75"
                : ""
            } ${
              passwordVisible
                ? "opacity-100 h-[50px] md:h-[46px] lg:h-[50px] mt-[11px]"
                : "h-0 opacity-0 mt-0"
            } text-[15px] px-[17px] items-center justify-center rounded-[12px] focus:ring-white/50 focus:ring-1 outline-none border-none`}
            style={{
              transition:
                "height 0.7s ease-in-out, margin-top 0.7s ease-in-out, opacity 0.5s ease-in-out",
              transitionDelay: passwordVisible ? "0s, 0s, 0.3s" : "0s",
              backgroundColor: appTheme[defaultTheme].background_3,
            }}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={inputs.password}
            onChange={(e: any) => {
              setInputs((prev) => ({
                ...prev,
                password: e.target.value.trim(),
              }));
            }}
            name="password"
            autoComplete="off"
          />
          <div className="w-full h-0 relative">
            <div
              ref={passwordVisibleRef}
              onClick={() => {
                setShowPassword((prev: boolean) => !prev);
              }}
              className={`${
                passwordVisible
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } brightness-90 cursor-pointer dim hover:brightness-75 select-none absolute 
              bottom-[17px] md:bottom-[15px] lg:bottom-[17px] right-[15px] rounded-full`}
              style={{
                transition: "opacity 0.9s ease-in-out, bottom 0.6s ease-in-out",
                transitionDelay: passwordVisible ? "0.7s, 0s" : "0s, 0s",
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoEyeOff color={appTheme[defaultTheme].text_2} size={16} />
              ) : (
                <IoEye color={appTheme[defaultTheme].text_2} size={16} />
              )}
            </div>

            <div
              ref={questionButtonRef}
              onClick={handleQuestionClick}
              className={`${
                passwordVisible && !signUpPage
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } brightness-90 cursor-pointer dim hover:brightness-75 select-none absolute  
              bottom-[15px] md:bottom-[13px] lg:bottom-[15px] right-[-30px] rounded-full pl-[1px]`}
              style={{
                transition: "opacity 0.9s ease-in-out, top 0.6s ease-in-out",
                transitionDelay: passwordVisible ? "0.7s, 0s" : "0s, 0s",
                border: `1px solid ${appTheme[defaultTheme].text_3}`,
              }}
              title="Forgot password"
            >
              <BsQuestion color={appTheme[defaultTheme].text_3} size={19} />
            </div>
          </div>
          <div
            className={`select-none dim ${
              (signUpPage &&
                (inputs.email.length === 0 ||
                  inputs.password.length === 0 ||
                  inputs.first_name.length === 0 ||
                  inputs.last_name.length === 0)) ||
              (!signUpPage &&
                (inputs.email.length === 0 || inputs.password.length === 0))
                ? "brightness-75"
                : "hover:brightness-75 cursor-pointer"
            } flex flex-row mt-[11px] items-center justify-center h-[50px] md:h-[46px] lg:h-[50px] rounded-[12px] text-[16px] font-[600]`}
            style={{
              backgroundColor:
                (signUpPage &&
                  (inputs.email.length === 0 ||
                    inputs.password.length === 0 ||
                    inputs.first_name.length === 0 ||
                    inputs.last_name.length === 0)) ||
                (!signUpPage &&
                  (inputs.email.length === 0 || inputs.password.length === 0))
                  ? appTheme[defaultTheme].background_3
                  : "white",
              color:
                (signUpPage &&
                  (inputs.email.length === 0 ||
                    inputs.password.length === 0 ||
                    inputs.first_name.length === 0 ||
                    inputs.last_name.length === 0)) ||
                (!signUpPage &&
                  (inputs.email.length === 0 || inputs.password.length === 0))
                  ? appTheme[defaultTheme].text_1
                  : appTheme[defaultTheme].background_1,
              transition:
                "color 0.2s ease-in-out, background-color 0.2s ease-in-out",
            }}
            onClick={handleContinueClick}
          >
            <div
              ref={containerRef}
              className="absolute mr-[120px] w-[100px] h-[100px] opacity-[80%]"
            />
            <p
              className={`${
                signInButtonText !== "Continue" ? "ml-[20px]" : ""
              }`}
            >
              {signInButtonText}
            </p>
          </div>
        </div>

        <div
          className={`${
            (signUpPage && nameInputVisible) ||
            (!signUpPage && !nameInputVisible)
              ? "opacity-100"
              : "opacity-0"
          } mt-[5%] text-[15.5] md:text-[15px] lg:text-[15.5px]`}
          style={{
            transition: "opacity 0.6s ease-in-out",
          }}
        >
          {signUpPage ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={triggerSignUpPage}
            className="ml-[1px] pb-[2px] cursor-pointer dim hover:brightness-75"
            style={{
              color: appTheme[defaultTheme].app_text_color_1,
              borderBottom: `1px solid ${appTheme[defaultTheme].app_text_color_1}`,
            }}
          >
            {signUpPage ? "Sign in" : "Sign up"}
          </span>
        </div>

        {/* <div
          className="text-[15px] md:text-[14.5px] lg:text-[15px] absolute bottom-[20px] text-center flex flex-col justify-center"
          style={{
            color: appTheme[defaultTheme].text_2,
          }}
        >
          <div className="">
            By proceeding, you agree to our{" "}
            <span
              onClick={() => {
                setDocumentVisible("terms");
                setHideDocument(false);
                setTimeout(() => {
                  setShowDocument(true);
                }, 100);
              }}
              className="cursor-pointer dim hover:brightness-75"
              style={{
                color: appTheme[defaultTheme].app_text_color_1,
                borderBottom: `1px solid ${appTheme[defaultTheme].app_text_color_1}`,
              }}
            >
              Terms of use
            </span>
          </div>
          <div>
            Read our{" "}
            <span
              onClick={() => {
                setDocumentVisible("privacy");
                setHideDocument(false);
                setTimeout(() => {
                  setShowDocument(true);
                }, 100);
              }}
              className="cursor-pointer dim hover:brightness-75"
              style={{
                color: appTheme[defaultTheme].app_text_color_1,
                borderBottom: `1px solid ${appTheme[defaultTheme].app_text_color_1}`,
              }}
            >
              Privacy Policy
            </span>
          </div>
        </div> */}

        {documentVisible !== null && (
          <div
            className={`${
              showDocument ? "opacity-100" : "opacity-0"
            } absolute top-0 left-0 w-[100%] h-[99%]`}
            style={{
              transition: "opacity 0.5s ease-in-out",
              transitionDelay: hideDocument ? "0.5s" : "0s",
              backgroundColor: appTheme[defaultTheme].background_stark,
            }}
          >
            <div
              className={`w-[calc(100%-50px)] h-full ml-[30px] mr-[20px] ${
                showDocument ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transition: "opacity 0.5s ease-in-out",
                transitionDelay: hideDocument ? "0s" : "0.5s",
              }}
            >
              <div
                className="absolute bottom-0 left-0 w-full h-[60px] items-center justify-center flex pl-[50px] pr-[40px]"
                style={{
                  backgroundColor: appTheme[defaultTheme].background_stark,
                }}
              >
                <div
                  className={`w-[200px] select-none dim brightness-75
                hover:brightness-50 cursor-pointer flex items-center justify-center h-[45px] rounded-[12px] text-[17px] font-[700]`}
                  style={{
                    backgroundColor: "white",
                    color: appTheme[defaultTheme].background_1,
                  }}
                  onClick={() => {
                    setHideDocument(true);
                    setShowDocument(false);
                    setTimeout(() => {
                      setDocumentVisible(null);
                    }, 1100);
                  }}
                >
                  Close
                </div>
              </div>
              {documentVisible === "terms" && <TermsDocument />}
              {documentVisible === "privacy" && <PrivacyDocument />}
            </div>

            <div
              className="w-full h-[20px] absolute bottom-[60px] left-0"
              style={{
                background: `linear-gradient(to top, ${appTheme[defaultTheme].background_stark}, transparent)`,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

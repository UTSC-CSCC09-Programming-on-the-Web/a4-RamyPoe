/* global meact */
// eslint-disable-next-line no-unused-vars
let stateEffects = (function () {
  "use strict";

  let module = {};

  const [isMyGallery, getIsMyGallery, setIsMyGallery] = meact.useState(false);
  module.setIsMyGallery = setIsMyGallery;
  module.getIsMyGallery = getIsMyGallery;
  // meact.useEffect(() => {
  //   console.log(getIsMyGallery());
  // }, [isMyGallery]);
  // TODO: delete this

  const [loginMsg, getLoginMsg, setLoginMsg] = meact.useState("");
  module.setLoginMsg = setLoginMsg;
  meact.useEffect(() => {
    document.querySelector("#loginStateMsg").innerHTML = getLoginMsg();
  }, [loginMsg]);

  const [showLoginForm, getShowLoginForm, setShowLoginForm] =
    meact.useState(false);
  module.getShowLoginForm = getShowLoginForm;
  module.setShowLoginForm = setShowLoginForm;
  meact.useEffect(() => {
    const loginContainer = document.querySelector("#loginContainer");
    if (getShowLoginForm()) {
      setLoginMsg("");
      loginContainer.classList.remove("animation-hide");
    } else {
      loginContainer.classList.add("animation-hide");
    }
  }, [showLoginForm]);

  const [viewListPage, getViewListPage, setViewListPage] = meact.useState(true);
  module.setViewListPage = setViewListPage;
  module.getViewListPage = getViewListPage;
  meact.useEffect(() => {
    const userSelection = document.querySelector("#userSelection");
    const elementsHide = document.querySelectorAll(
      "#galleryContainer, #commentsSection",
    );

    if (getViewListPage()) {
      userSelection.classList.remove("hidden");
      elementsHide.forEach((elmt) => elmt.classList.add("hidden"));
    } else {
      userSelection.classList.add("hidden");
      elementsHide.forEach((elmt) => elmt.classList.remove("hidden"));
    }
    setShowLoginForm(false);
  }, [viewListPage]);

  const [isEmpty, getIsEmpty, setIsEmpty] = meact.useState(false);
  module.getIsEmpty = getIsEmpty;
  module.setIsEmpty = setIsEmpty;
  meact.useEffect(() => {
    if (getViewListPage()) return;
    const emptyState = getIsEmpty();
    const uiElementsWhenFull = document.querySelectorAll(
      "#commentsSection, #imageCaption, #imageContainer > *, #galleryHeader > *",
    );
    const emptyBanner = document.querySelector("#emptyImgBanner");
    const addImgBtn = document.querySelector("#addImgBtn");
    const removeImgBtn = document.querySelector("#removeImgBtn");

    if (emptyState) {
      uiElementsWhenFull.forEach((el) => el.classList.add("hidden"));
      emptyBanner.classList.remove("hidden");
      if (getIsMyGallery()) addImgBtn.classList.remove("hidden");
    } else {
      uiElementsWhenFull.forEach((el) => el.classList.remove("hidden"));
      emptyBanner.classList.add("hidden");
      if (!getIsMyGallery()) addImgBtn.classList.add("hidden");
      if (!getIsMyGallery()) removeImgBtn.classList.add("hidden");
    }
  }, [isEmpty, isMyGallery]);

  const [username, getUsername, setUsername] = meact.useState("");
  module.setUsername = setUsername;
  meact.useEffect(() => {
    document.querySelector("#userInfoName").innerHTML = getUsername();
  }, [username]);

  const [signedIn, getSignedIn, setSignedIn] = meact.useState(false);
  module.setSignedIn = setSignedIn;
  module.getSignedIn = getSignedIn;
  module.signedIn = signedIn;
  meact.useEffect(() => {
    const loginBtn = document.querySelector("#loginBtn");
    const myGalleryBtn = document.querySelector("#myGalleryBtn");

    if (getSignedIn()) {
      loginBtn.innerHTML = "LOGOUT";
      myGalleryBtn.classList.remove("hidden");
    } else {
      loginBtn.innerHTML = "LOGIN";
      myGalleryBtn.classList.add("hidden");
      setUsername("");
    }
  }, [signedIn]);

  const [showUploadForm, getShowUploadForm, setShowUploadForm] =
    meact.useState(false);
  module.getShowUploadForm = getShowUploadForm;
  module.setShowUploadForm = setShowUploadForm;
  meact.useEffect(() => {
    const uploadForm = document.querySelector("#uploadImageContainer");
    if (getShowUploadForm()) {
      uploadForm.classList.remove("animation-hide");
    } else {
      uploadForm.classList.add("animation-hide");
    }
  }, [showUploadForm]);

  const [buttonsDisabled, getButtonsDisabled, setButtonsDisabled] =
    meact.useState(true);
  module.setButtonsDisabled = setButtonsDisabled;
  module.getButtonsDisabled = getButtonsDisabled;
  meact.useEffect(() => {
    const buttons = document.querySelectorAll(
      "button, .page-link, #homePageTitle",
    );
    if (getButtonsDisabled()) {
      buttons.forEach((btn) => btn.setAttribute("disabled", "disabled"));
    } else {
      buttons.forEach((btn) => btn.removeAttribute("disabled"));
    }
  }, [buttonsDisabled]);

  // "loading", "loaded", "failed"
  const [imgState, getImgState, setImgState] = meact.useState("loaded");
  module.setImgState = setImgState;
  const [deleteImgState, getDeleteImgState, setDeleteImgState] =
    meact.useState("loaded");
  module.setDeleteImgState = setDeleteImgState;
  const [uploadImgState, getUploadImgState, setUploadImgState] =
    meact.useState("loaded");
  module.setUploadImgState = setUploadImgState;
  const [commentsState, getCommentsState, setCommentsState] =
    meact.useState("disabled"); // "empty", "disabled"
  module.getCommentsState = getCommentsState;
  module.setCommentsState = setCommentsState;
  const [galleryListState, getGalleryListState, setGalleryListState] =
    meact.useState("loading"); // "empty"
  module.setGalleryListState = setGalleryListState;
  module.getGalleryListState = getGalleryListState;

  meact.useEffect(() => {
    const deleteState = getDeleteImgState();
    const removeImgBtn = document.querySelector("#removeImgBtn");

    if (deleteState === "loading") {
      removeImgBtn.innerHTML = "DELETING...";
      setButtonsDisabled(true);
    }
    if (deleteState === "loaded") {
      removeImgBtn.innerHTML = "DELETE IMAGE";
      setButtonsDisabled(false);
    }
    if (deleteState === "failed") {
      removeImgBtn.innerHTML = "FAILED!";
      setTimeout(() => {
        setDeleteImgState("loaded");
      }, 2000);
    }
  }, [deleteImgState]);

  meact.useEffect(() => {
    const uploadState = getUploadImgState();
    const addImgBtn = document.querySelector("#addImgBtn");

    if (uploadState === "loading") {
      addImgBtn.innerHTML = "UPLOADING...";
      setButtonsDisabled(true);
    }
    if (uploadState === "loaded") {
      addImgBtn.innerHTML = "ADD NEW IMAGE";
      setButtonsDisabled(false);
    }
    if (uploadState === "failed") {
      addImgBtn.innerHTML = "ADDDING FAILED!";
      setTimeout(() => {
        setUploadImgState("loaded");
      }, 2000);
    }
  }, [uploadImgState]);

  meact.useEffect(() => {
    const state = getImgState();
    const spinningLoaderImage = document.querySelector("#spinningLoaderImage");
    const galleryImage = document.querySelector("#galleryImage");
    const failedBanner = document.querySelector("#failedImgBanner");

    if (state === "loading") {
      galleryImage.classList.add("hidden");
      spinningLoaderImage.classList.remove("hidden");
      failedBanner.classList.add("hidden");
    }
    if (state === "loaded") {
      spinningLoaderImage.classList.add("hidden");
      failedBanner.classList.add("hidden");
      galleryImage.classList.remove("hidden");
    }
    if (state === "failed") {
      galleryImage.classList.add("hidden");
      spinningLoaderImage.classList.add("hidden");
      failedBanner.classList.remove("hidden");
    }
  }, [imgState]);

  meact.useEffect(() => {
    const state = getCommentsState();
    const spinningLoader = document.querySelector("#spinningLoaderComments");
    const commentsContainer = document.querySelector("#comments");
    const failedBanner = document.querySelector("#failedCommentsBanner");
    const emptyBanner = document.querySelector("#emptyCommentsBanner");
    const pageNumberText = document.querySelector("#pageNumberDisplay");
    const commentsSection = document.querySelector("#commentsSection");

    if (state === "disabled") {
      commentsSection.classList.add("hidden");
    } else if (!getViewListPage()) {
      commentsSection.classList.remove("hidden");
    }

    if (state === "loading") {
      commentsContainer.classList.add("hidden");
      spinningLoader.classList.remove("hidden");
      failedBanner.classList.add("hidden");
      emptyBanner.classList.add("hidden");
      pageNumberText.innerHTML = "Showing 0-0 of 0";
    }
    if (state === "loaded") {
      spinningLoader.classList.add("hidden");
      failedBanner.classList.add("hidden");
      emptyBanner.classList.add("hidden");
      commentsContainer.classList.remove("hidden");
    }
    if (state === "failed") {
      commentsContainer.classList.add("hidden");
      spinningLoader.classList.add("hidden");
      failedBanner.classList.remove("hidden");
      emptyBanner.classList.add("hidden");
      pageNumberText.innerHTML = "Showing 0-0 of 0";
    }
    if (state === "empty") {
      commentsContainer.classList.add("hidden");
      spinningLoader.classList.add("hidden");
      failedBanner.classList.add("hidden");
      emptyBanner.classList.remove("hidden");
      pageNumberText.innerHTML = "Showing 0-0 of 0";
    }
  }, [commentsState]);

  meact.useEffect(() => {
    const state = getGalleryListState();
    const spinningLoader = document.querySelector("#spinningLoaderUsers");
    const commentsContainer = document.querySelector("#usersContainer");
    const failedBanner = document.querySelector("#failedUsersBanner");
    const emptyBanner = document.querySelector("#emptyUsersBanner");
    const usersPageInfo = document.querySelector("#usersPageInfo");

    if (state === "loading") {
      commentsContainer.classList.add("hidden");
      spinningLoader.classList.remove("hidden");
      failedBanner.classList.add("hidden");
      emptyBanner.classList.add("hidden");
      usersPageInfo.classList.add("hidden");
    }
    if (state === "loaded") {
      spinningLoader.classList.add("hidden");
      failedBanner.classList.add("hidden");
      emptyBanner.classList.add("hidden");
      commentsContainer.classList.remove("hidden");
      usersPageInfo.classList.remove("hidden");
      setButtonsDisabled(false);
    }
    if (state === "failed") {
      commentsContainer.classList.add("hidden");
      spinningLoader.classList.add("hidden");
      failedBanner.classList.remove("hidden");
      emptyBanner.classList.add("hidden");
      usersPageInfo.classList.add("hidden");
      setButtonsDisabled(false);
    }
    if (state === "empty") {
      commentsContainer.classList.add("hidden");
      spinningLoader.classList.add("hidden");
      failedBanner.classList.add("hidden");
      emptyBanner.classList.remove("hidden");
      usersPageInfo.classList.add("hidden");
      setButtonsDisabled(false);
    }
  }, [galleryListState]);

  return module;
})();

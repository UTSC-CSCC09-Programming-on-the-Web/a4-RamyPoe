/* global meact, apiService, stateEffects */
(function () {
  "use strict";

  let controller = new AbortController(); // Abort unneeded fetches
  function isEmptyObj(obj) {
    for (let i in obj) {
      return false;
    }
    return true;
  }

  const [userData, getUserData, setUserData] = meact.useState({});

  const GALLERY_PAGE_LIMIT = 10;
  const [selectedUser, getSelectedUser, setSelectedUser] = meact.useState({
    userId: -1,
    username: "----",
  });
  const [userListPage, getUserListPage, setUserListPage] = meact.useState(0);
  const [userListData, getUserListData, setUserListData] = meact.useState({});

  const [selectedImage, getSelectedImage, setSelectedImage] = meact.useState(0);
  const [imageData, getImageData, setImageData] = meact.useState({});

  const COMMENT_PAGE_LIMIT = 10;
  const [commentsPage, getCommentsPage, setCommentsPage] = meact.useState(0);
  const [commentsData, getCommentsData, setCommentsData] = meact.useState({});

  function CommentComponent(userId, author, comment, date, commentId) {
    let elmt = document.createElement("div");
    elmt.className = "comment";
    elmt.id = `msg${commentId}`;
    elmt.innerHTML = `
        <div class="comment-header">
          <div class="header-container">
            <span class="comment-author">${author}</span>
            &#x2022
            <span class="comment-date">${date.toLocaleString()}</span>
          </div>
          ${
            stateEffects.getIsMyGallery() || userId === getUserData()?.userId
              ? `<button class="delete-comment-btn">Delete</button>`
              : ""
          }
        </div>
        <p class="comment-body">${comment}</p>`;
    elmt.querySelector(".delete-comment-btn")?.addEventListener("click", () => {
      stateEffects.setCommentsState("loading");
      apiService.deleteComment(commentId).then(reloadCommentPage);
    });
    return elmt;
  }

  function GalleryUserComponent(userId, username) {
    let elmt = document.createElement("div");
    elmt.className = "user-gallery";
    elmt.id = `user${userId}`;
    elmt.innerHTML = `
        <p class="user-gallery-name">${username}</p>
        <hr class="dashed-line" />
        <button class="btn user-select-btn">VIEW</button>`;
    elmt.querySelector(".user-select-btn").addEventListener("click", () => {
      stateEffects.setViewListPage(false);
      stateEffects.setButtonsDisabled(true);
      setSelectedUser({ userId, username });
    });
    return elmt;
  }

  function setAuthorTitleUI(author, title) {
    document.querySelector("#imageAuthor").innerHTML = author || "----";
    document.querySelector("#imageTitle").innerHTML = title || "----";
  }

  function setImgPosTotalUI(position, total) {
    document.querySelector("#imageCount").innerHTML =
      `${position || 0}/${total || 0}`;
  }

  function reloadGallery() {
    setSelectedUser(getSelectedUser());
  }

  function reloadCommentPage() {
    setCommentsPage(getCommentsPage());
  }

  function reloadUsersList() {
    setUserListPage(0);
  }

  meact.useEffect(() => {
    const sUser = getSelectedUser();
    if (sUser.userId < 0) return;
    stateEffects.setIsMyGallery(
      stateEffects.getSignedIn() && sUser.userId === getUserData()?.userId,
    );
    setSelectedImage(0);
  }, [selectedUser]);

  meact.useEffect(() => {
    const newData = getImageData();
    if (isEmptyObj(newData)) {
      return;
    }
    const newImageData = newData.image;
    const galleryImage = document.querySelector("#galleryImage");

    stateEffects.setImgState("loading");
    galleryImage.src = `/api/images/${newImageData.imageId}/picture`;
    setAuthorTitleUI(getSelectedUser()?.username, newImageData.title);
    setImgPosTotalUI(newData.position + 1, newData.total);
  }, [imageData]);

  meact.useEffect(() => {
    if (stateEffects.getViewListPage()) {
      stateEffects.setButtonsDisabled(false);
      return;
    }
    const newSelectedImage = getSelectedImage();
    if (newSelectedImage < 0) {
      setSelectedImage(0);
      return;
    }
    stateEffects.setShowUploadForm(false);
    setAuthorTitleUI(); // Reset to intermediary state

    controller.abort(); // Abort previous request if any
    controller = new AbortController();

    stateEffects.setIsEmpty(false);
    stateEffects.setImgState("loading");
    if (stateEffects.getSignedIn()) stateEffects.setCommentsState("loading");
    else stateEffects.setCommentsState("disabled");
    apiService
      .getImages(
        getSelectedUser().userId,
        newSelectedImage,
        1,
        controller.signal,
      )
      .then((newImage) => {
        if (newImage.total === 0) {
          stateEffects.setButtonsDisabled(false);
          stateEffects.setIsEmpty(true);
          return;
        }
        if (newImage.images.length === 0) {
          setSelectedImage(newImage.total - 1);
          return;
        }

        newImage.image = newImage.images[0]; // Had limit of 1
        delete newImage.images;
        newImage.position = newSelectedImage;

        stateEffects.setButtonsDisabled(false);
        stateEffects.setIsEmpty(false);
        setImageData(newImage);
        if (stateEffects.getSignedIn())
          setCommentsPage(0); // Will use new image
        else stateEffects.setCommentsState("disabled");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          stateEffects.setImgState("failed");
        }
      });
  }, [selectedImage]);

  meact.useEffect(() => {
    const page = getCommentsPage();
    const imgData = getImageData();
    if (isEmptyObj(imgData)) {
      return;
    }

    if (page < 0) {
      setCommentsPage(0);
      return;
    }
    stateEffects.setCommentsState("loading");
    apiService
      .getComments(
        imgData.image.imageId,
        page,
        COMMENT_PAGE_LIMIT,
        controller.signal,
      )
      .then((newComments) => {
        if (newComments.comments.length === 0) {
          if (page !== 0) {
            setCommentsPage(page - 1);
          } else {
            stateEffects.setCommentsState("empty");
          }
          return;
        }

        newComments.comments.forEach((comment) => {
          comment.postedDate = new Date(comment.postedDate);
        });
        setCommentsData(newComments);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.log(error);
          stateEffects.setCommentsState("failed");
        }
      });
  }, [commentsPage]);

  meact.useEffect(() => {
    const page = getUserListPage();
    if (page < 0) {
      setUserListPage(0);
      return;
    }
    stateEffects.setGalleryListState("loading");
    apiService
      .getUsers(page, GALLERY_PAGE_LIMIT, controller.signal)
      .then((newUsersList) => {
        if (newUsersList.users.length === 0) {
          if (page !== 0) {
            setUserListPage(page - 1);
          } else {
            stateEffects.setGalleryListState("empty");
          }
          return;
        }

        setUserListData(newUsersList);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          stateEffects.setGalleryListState("failed");
        }
      });
  }, [userListPage]);

  meact.useEffect(() => {
    const commentsData = getCommentsData();
    const page = getCommentsPage();
    if (!commentsData.comments) {
      return;
    }

    const startNum = Math.min(
      page * COMMENT_PAGE_LIMIT + 1,
      commentsData.total,
    );
    const endNum = Math.min(
      (page + 1) * COMMENT_PAGE_LIMIT,
      commentsData.total,
    );
    const text = `Showing ${startNum}-${endNum} of ${commentsData.total}`;
    document.querySelector("#pageNumberDisplay").innerHTML = text;

    const commentsDiv = document.querySelector("#comments");
    commentsDiv.innerHTML = "";
    commentsData.comments.forEach((c) => {
      const element = CommentComponent(
        c.userId,
        c.username,
        c.content,
        c.postedDate,
        c.commentId,
      );
      commentsDiv.append(element);
    });
    stateEffects.setCommentsState("loaded");
  }, [commentsData]);

  meact.useEffect(() => {
    const usersData = getUserListData();
    const page = getUserListPage();
    if (!usersData.users) {
      return;
    }

    const startNum = Math.min(page * GALLERY_PAGE_LIMIT + 1, usersData.total);
    const endNum = Math.min((page + 1) * GALLERY_PAGE_LIMIT, usersData.total);
    const text = `Showing ${startNum}-${endNum} of ${usersData.total}`;
    document.querySelector("#pageUsersNumberDisplay").innerHTML = text;

    const usersListDiv = document.querySelector("#usersContainer");
    usersListDiv.innerHTML = "";
    usersData.users.forEach((u) => {
      const element = GalleryUserComponent(u.userId, u.username);
      usersListDiv.append(element);
    });
    stateEffects.setGalleryListState("loaded");
  }, [userListData]);

  meact.useEffect(() => {
    apiService.setToken(getUserData()?.token);
  }, [userData]);

  window.addEventListener("DOMContentLoaded", function () {
    stateEffects.setButtonsDisabled(true); // Wait for initial data load

    const galleryImage = document.querySelector("#galleryImage");
    galleryImage.addEventListener("load", () => {
      stateEffects.setImgState("loaded");
    });
    galleryImage.addEventListener("error", () => {
      stateEffects.setImgState("failed");
    });

    document.querySelector("#addImgBtn").addEventListener("click", () => {
      stateEffects.setShowUploadForm(!stateEffects.getShowUploadForm());
    });
    document.querySelector("#removeImgBtn").addEventListener("click", () => {
      stateEffects.setShowUploadForm(false);
      stateEffects.setDeleteImgState("loading");
      apiService
        .deleteImage(getImageData().image.imageId)
        .then(() => {
          const selImg = getSelectedImage();
          const totalImgs = getImageData().total;
          const predictTotal = totalImgs - 1;
          const predictPos = selImg + 1 === totalImgs ? selImg - 1 : selImg;
          setSelectedImage(predictPos);
          setImgPosTotalUI(predictPos + 1, predictTotal);
          stateEffects.setDeleteImgState("loaded");
        })
        .catch(() => stateEffects.setDeleteImgState("failed"));
    });

    document.querySelector("#prevImgBtn").addEventListener("click", () => {
      stateEffects.setShowUploadForm(false);
      const curPos = getSelectedImage();
      if (curPos <= 0 || getImageData().total === 0) {
        return;
      }
      setImgPosTotalUI(curPos, getImageData().total);
      setSelectedImage(curPos - 1);
    });
    document.querySelector("#nextImgBtn").addEventListener("click", () => {
      stateEffects.setShowUploadForm(false);
      const curPos = getSelectedImage();
      const imgData = getImageData();
      if (curPos + 1 >= imgData.total || imgData.total === 0) {
        return;
      }
      setImgPosTotalUI(curPos + 2, imgData.total);
      setSelectedImage(curPos + 1);
    });

    document
      .querySelector("#prevCommentPageLink")
      .addEventListener("click", () => {
        const curPage = getCommentsPage();
        if (curPage <= 0 || stateEffects.getCommentsState() !== "loaded") {
          return;
        }
        setCommentsPage(curPage - 1);
      });
    document
      .querySelector("#nextCommentPageLink")
      .addEventListener("click", () => {
        const curPage = getCommentsPage();
        if (
          (curPage + 1) * COMMENT_PAGE_LIMIT >= getCommentsData().total ||
          stateEffects.getCommentsState() !== "loaded"
        ) {
          return;
        }
        setCommentsPage(curPage + 1);
      });

    document
      .querySelector("#prevUsersPageLink")
      .addEventListener("click", () => {
        stateEffects.setShowLoginForm(false);
        const curPage = getUserListPage();
        if (curPage <= 0 || stateEffects.getGalleryListState() !== "loaded") {
          return;
        }
        setUserListPage(curPage - 1);
      });
    document
      .querySelector("#nextUsersPageLink")
      .addEventListener("click", () => {
        stateEffects.setShowLoginForm(false);
        const curPage = getUserListPage();
        if (
          (curPage + 1) * GALLERY_PAGE_LIMIT >= getUserListData().total ||
          stateEffects.getGalleryListState() !== "loaded"
        ) {
          return;
        }
        setUserListPage(curPage + 1);
      });

    document.querySelector("#loginBtn").addEventListener("click", () => {
      if (!stateEffects.getSignedIn()) {
        stateEffects.setShowLoginForm(!stateEffects.getShowLoginForm());
      } else {
        stateEffects.setButtonsDisabled(true);
        apiService.signout().then(() => {
          setUserData({});
          stateEffects.setSignedIn(false);
          reloadGallery();
          stateEffects.setButtonsDisabled(false);
        });
      }
    });

    document.querySelector("#myGalleryBtn").addEventListener("click", () => {
      stateEffects.setViewListPage(false);
      setSelectedUser({
        userId: getUserData()?.userId ?? -1,
        username: getUserData()?.username ?? "----",
      });
    });

    document.querySelector("#homePageTitle").addEventListener("click", () => {
      if (stateEffects.getButtonsDisabled()) return;
      stateEffects.setViewListPage(true);
      reloadUsersList();
    });

    const uploadImageForm = document.querySelector("#uploadImageForm");
    uploadImageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      stateEffects.setUploadImgState("loading");
      apiService
        .addImage(formData)
        .then(() => {
          setImgPosTotalUI(
            1,
            (stateEffects.getIsEmpty() ? 0 : getImageData().total) + 1,
          );
          setSelectedImage(0);
          stateEffects.setUploadImgState("loaded");
        })
        .catch(() => stateEffects.setUploadImgState("failed"));

      uploadImageForm.reset();
      stateEffects.setShowUploadForm(false);
    });

    const postCommentForm = document.querySelector("#postCommentForm");
    postCommentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (stateEffects.getCommentsState() === "loading") {
        return;
      }

      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      const author = formProps.username;
      const content = formProps.content;
      postCommentForm.reset();

      stateEffects.setCommentsState("loading");
      apiService
        .addComment(getImageData().image.imageId, author, content)
        .then(reloadCommentPage);
    });

    const loginForm = document.querySelector("#loginForm");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      const username = formProps.username;
      const password = formProps.password;
      loginForm.reset();

      stateEffects.setLoginMsg("Please wait...");
      if (e.submitter.id === "signupBtn") {
        apiService.signup(username, password).then((res) => {
          stateEffects.setLoginMsg(
            res.error ? res.error : "Success! Please sign in...",
          );
          reloadUsersList();
        });
      }
      if (e.submitter.id === "signinBtn") {
        apiService.signin(username, password).then((res) => {
          if (res.error) {
            stateEffects.setLoginMsg(res.error);
          } else {
            stateEffects.setShowLoginForm(false);
            res.username = username;
            setUserData(res);

            stateEffects.setUsername(username);
            stateEffects.setSignedIn(true);
            reloadGallery();
          }
        });
      }
    });
  });
})();

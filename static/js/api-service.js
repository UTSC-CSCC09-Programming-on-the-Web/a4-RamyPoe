// eslint-disable-next-line no-unused-vars
let apiService = (function () {
  "use strict";

  let module = {};

  let bearerToken = "";
  module.setToken = function (token) {
    bearerToken = token;
  };

  module.addImage = function (formData) {
    return fetch("/api/images", {
      method: "POST",
      headers: { Authorization: `Bearer ${bearerToken}` },
      body: formData,
    }).then((res) => res.json());
  };

  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    }).then((res) => res.json());
  };

  module.getImageFromId = function (imageId, signal = undefined) {
    return fetch(`/api/images/${imageId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: signal,
    }).then((res) => res.json());
  };

  module.getImages = function (userId, page, limit, signal = undefined) {
    return fetch(`/api/users/${userId}/images?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: signal,
    }).then((res) => res.json());
  };

  module.addComment = function (imageId, author, content) {
    return fetch(`/api/images/${imageId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ author, content }),
    }).then((res) => res.json());
  };

  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    }).then((res) => res.json());
  };

  module.getComments = function (
    imageId,
    page,
    limit = 10,
    signal = undefined,
  ) {
    return fetch(
      `/api/images/${imageId}/comments?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
        signal: signal,
      },
    ).then((res) => res.json());
  };

  module.getUsers = function (page, limit, signal = undefined) {
    return fetch(`/api/users?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: signal,
    }).then((res) => res.json());
  };

  module.signup = function (username, password) {
    return fetch(`/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json());
  };

  module.signin = function (username, password) {
    return fetch(`/api/users/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json());
  };

  module.signout = function () {
    return fetch(`/api/users/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    }).then((res) => res.json());
  };

  return module;
})();

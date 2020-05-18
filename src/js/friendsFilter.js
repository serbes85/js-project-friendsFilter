import template from "../template.hbs";

let leftList = document.querySelector("#friends-list");
let rightList = document.querySelector("#friends-filtered");

function closeFilter() {
  let buttonClose = document.querySelector('.button-close')

  buttonClose.addEventListener('click', function(){
    let filter = document.querySelector('.filter');

    filter.style.display = 'none';
  })
}

VK.init({
  apiId: #######,
});

function auth() {
  return new Promise((resolve, reject) => {
    VK.Auth.login((data) => {
      if (data.session) {
        resolve();
      } else {
        reject(new Error("Не удалось авторизоваться"));
      }
    }, 2);
  });
}

function callAPI(method, params) {
  params.v = "5.103";

  return new Promise((resolve, reject) => {
    VK.api(method, params, (data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.response);
      }
    });
  });
}

function loadFriends(allFriends, pickedFriends, leftListNode, rightListNode) {
  let rightList = allFriends.filter(({ id }) =>
    pickedFriends.includes(String(id))
  );
  let leftList = allFriends.filter(
    ({ id }) => !pickedFriends.includes(String(id))
  );

  rightListNode.insertAdjacentHTML(
    "beforeend",
    template({ items: rightList, flag: false })
  );
  leftListNode.insertAdjacentHTML(
    "beforeend",
    template({ items: leftList, flag: true })
  );
}

function dragAndDrop(lists, arrayFriends) {
  let currentDrag;

  lists.forEach((list) => {
    list.addEventListener("dragstart", (e) => {
      const currentFriend = e.target.closest(".friend-item");
      const currentFriendId = currentFriend.dataset.id;
      const friendFiltered = arrayFriends.filter(
        (elem) => elem.id === parseInt(currentFriendId)
      );

      if (!currentFriend) return;

      const newFriend = template({
        items: friendFiltered,
        flag: list.id !== "friends-list",
      });
      console.log(newFriend);

      currentDrag = {
        source: list,
        friendMarkup: newFriend,
        currentFriendNode: currentFriend,
      };
    });

    list.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    list.addEventListener("drop", (e) => {
      const dropFriend = e.target.closest(".friend-item");
      console.log("drop", dropFriend);
      if (currentDrag && dropFriend && currentDrag.source !== list) {
        e.preventDefault();

        dropFriend.insertAdjacentHTML("afterend", currentDrag.friendMarkup);

        currentDrag.currentFriendNode.remove();
      }

      currentDrag = {};
    });
  });
}

function searchByName(list, input) {
  let inputValue = input.value.toLowerCase();

  list.forEach((item) => {
    if (item.innerHTML.toLowerCase().indexOf(inputValue) > -1) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

function search() {
  let inputLeft = document.getElementById("searchLeft");
  let inputRight = document.getElementById("searchRight");

  inputLeft.addEventListener("keyup", function () {
    let leftList = document.querySelectorAll("#friends-list li");

    searchByName(leftList, inputLeft);
  });

  inputRight.addEventListener("keyup", function () {
    let rightList = document.querySelectorAll("#friends-filtered li");

    searchByName(rightList, inputRight);
  });
}

auth()
  .then(() => {
    return callAPI("users.get", { name_case: "gen" });
  })
  .then(([me]) => {
    return callAPI("friends.get", { fields: "city, country, photo_100" });
  })
  .then((friends) => {
    let arrayFriends = friends.items;

    (function addFriends() {
      leftList.addEventListener("click", function (e) {
        e.preventDefault();

        let buttonAdd = e.target.closest(".button-add");
        let friendAdd = e.target.closest(".friend-item");

        if (!buttonAdd) {
          return;
        }

        if (buttonAdd && friendAdd) {
          let currentFriend = arrayFriends.filter(
            (elem) => elem.id === parseInt(friendAdd.dataset.id)
          );

          friendAdd.remove();
          rightList.insertAdjacentHTML(
            "beforeend",
            template({ items: currentFriend, flag: false })
          );
        }
      });
    })();
    (function deletedFriends() {
      rightList.addEventListener("click", function (e) {
        e.preventDefault();

        let buttonDeleted = e.target.closest(".button-remove");
        let friendDeleted = e.target.closest(".friend-item");

        if (!buttonDeleted) {
          return;
        }

        if (buttonDeleted && friendDeleted) {
          let currentFriend = arrayFriends.filter(
            (elem) => elem.id === parseInt(friendDeleted.dataset.id)
          );

          friendDeleted.remove();
          leftList.insertAdjacentHTML(
            "afterbegin",
            template({ items: currentFriend, flag: true })
          );
        }
      });
    })();

    (function saveFriends() {
      let buttonSave = document.querySelector(".button__save");

      buttonSave.addEventListener("click", function (e) {
        e.preventDefault();

        let friendsArr = [].reduce.apply(rightList.children, [
          (acc, elem) => {
            acc.push(elem.dataset.id);
            return acc;
          },
          [],
        ]);
        let serialFriendsArr = JSON.stringify(friendsArr);

        localStorage.setItem("myFriends", serialFriendsArr);
        console.log("SAVE", friendsArr);
      });
    })();
    search();
    dragAndDrop([leftList, rightList], arrayFriends);
    loadFriends(
      arrayFriends,
      JSON.parse(localStorage.getItem("myFriends")),
      leftList,
      rightList
    );
    closeFilter();
  });

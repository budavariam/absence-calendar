export const DISPATCH_ACTION = {
    "CHECK_MEMBER": "CHECK_MEMBER",
    "UPDATE_EVENT": "UPDATE_EVENT",

}

export const LOCALSTORAGE_KEY = {
    "RAWEVENTDATA": "RAWEVENTDATA",
    "SELECTEDMEMBERS": "SELECTEDMEMBERS",
}

export const LOCALSTORAGE_DEFAULT = {
    "RAWEVENTDATA": `[
        {
          "who": "John Doe",
          "start": "2022-06-30",
          "end": "2022-07-09"
        },
        {
          "who": "Jane Doe",
          "start": "2022-07-05",
          "end": "2022-07-13"
        }
      ]`,
    "SELECTEDMEMBERS": "[]",
}
export const DISPATCH_ACTION = {
    "CHECK_MEMBER": "CHECK_MEMBER",
    "UPDATE_EVENT": "UPDATE_EVENT",

}

export const LOCALSTORAGE_KEY = {
    "RAWEVENTDATA": "RAWEVENTDATA",
    "SELECTEDMEMBERS": "SELECTEDMEMBERS",
}


function generateDate(addToCurrentMonth = 0, setDay = 1) {
  const now = new Date();
  const generatedDate = new Date(now.getFullYear(), now.getMonth()+addToCurrentMonth, setDay);
  return generatedDate.toISOString().split('T')[0]
}

export const LOCALSTORAGE_DEFAULT = {
    "RAWEVENTDATA": `[
        {
          "who": "John Doe",
          "start": "${generateDate(0, 25)}",
          "end": "${generateDate(1, 3)}"
        },
        {
          "who": "Jane Doe",
          "start": "${generateDate(1, 2)}",
          "end": "${generateDate(1, 13)}"
        }
      ]`,
    "SELECTEDMEMBERS": "[]",
}
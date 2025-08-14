export const DISPATCH_ACTION = {
  "CHECK_MEMBER": "CHECK_MEMBER",
  "UPDATE_FAVOURITES": "UPDATE_FAVOURITES",
  "UPDATE_EVENT": "UPDATE_EVENT",
}

export const LOCALSTORAGE_KEY = {
  "RAWEVENTDATA": "RAWEVENTDATA",
  "SELECTEDMEMBERS": "SELECTEDMEMBERS",
  "FAVOURITE_MEMBERS": "FAVOURITE_MEMBERS",
  "IMPORTER_TITLE": "IMPORTER_TITLE",
  "IMPORTER_INPUT": "IMPORTER_INPUT",
}


function generateDate(addToCurrentMonth = 0, setDay = 1) {
  const now = new Date();
  const generatedDate = new Date(now.getFullYear(), now.getMonth() + addToCurrentMonth, setDay);
  return generatedDate.toISOString().split('T')[0]
}

const defaultMembers = [
  "John Doe",
  "Jane Doe"
]

export const LOCALSTORAGE_DEFAULT = {
  "RAWEVENTDATA": `[
        {
          "who": "${defaultMembers[0]}",
          "start": "${generateDate(0, 25)}",
          "end": "${generateDate(1, 3)}"
        },
        {
          "who": "${defaultMembers[1]}",
          "start": "${generateDate(1, 2)}",
          "end": "${generateDate(1, 13)}"
        }
      ]`,
  "SELECTEDMEMBERS": JSON.stringify(defaultMembers),
  "FAVOURITE_MEMBERS": JSON.stringify([defaultMembers[0]]),
  "IMPORTER_TITLE": "CSV Importer",
  "IMPORTER_INPUT": `Code;Name;From;To\n1;John Doe;17-Aug-2025;22-Aug-2025\n2;Jane Doe;20-Aug-2025;25-Aug-2025`
}

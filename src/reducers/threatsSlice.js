import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  securityProblemDefinition: "",
};

export const threatsSlice = createSlice({
  name: "threats",
  initialState,
  reducers: {
    UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION: (state, action) => {
      state.securityProblemDefinition = action.payload.newDefinition;
    },
    CREATE_THREAT_SECTION: (state, action) => {
      let newId = uuidv4();
      let title = action.payload.title;
      if (!state.hasOwnProperty(newId)) {
        state[newId] = {
          title: title,
          definition: "",
          terms: {},
          open: false,
        };
        action.payload = newId;
      } else {
        action.payload = null;
      }
    },
    UPDATE_THREAT_SECTION_TITLE: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].title = newTitle;
        }
      }
    },
    UPDATE_THREAT_SECTION_DEFINITION: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      let newDefinition = action.payload.newDefinition;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].definition = newDefinition;
        }
      }
    },
    DELETE_THREAT_SECTION: (state, action) => {
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          delete state[uuid];
        }
      }
    },
    COLLAPSE_THREAT_SECTION: (state, action) => {
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.hasOwnProperty(uuid)) {
        if (state[uuid].title === title) {
          state[uuid].open = open !== null && typeof open === "boolean" ? open : !state[uuid].open;
        }
      }
    },
    CREATE_THREAT_TERM: (state, action) => {
      const { threatUUID, title = "", from = [], definition = "", consistencyRationale = "", objectives = [], sfrs = [] } = action.payload;
      let uuid = uuidv4();

      if (threatUUID && state.hasOwnProperty(threatUUID)) {
        let currentTermList = state[threatUUID];

        if (!currentTermList.hasOwnProperty(uuid)) {
          currentTermList.terms[uuid] = {
            title,
            definition,
            from,
            consistencyRationale,
            objectives: objectives,
            sfrs,
            open: false,
            tableOpen: false,
          };
        }
      }
      // Sort terms lists
      threatsSlice.caseReducers.SORT_THREATS_TERMS_LIST_HELPER(state);

      action.payload.id = uuid;
    },
    UPDATE_THREAT_TERM_TITLE: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let originalTitle = action.payload.title;
      let newTitle = action.payload.newTitle;
      if (state.hasOwnProperty(threatUUID)) {
        if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === originalTitle) {
          state[threatUUID].terms[uuid].title = newTitle;
        }
      }
      // Sort terms lists
      threatsSlice.caseReducers.SORT_THREATS_TERMS_LIST_HELPER(state);
    },
    UPDATE_THREAT_TERM_DEFINITION: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let originalTitle = action.payload.title;
      let newDefinition = action.payload.newDefinition;
      if (state.hasOwnProperty(threatUUID)) {
        if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === originalTitle) {
          state[threatUUID].terms[uuid].definition = newDefinition;
        }
      }
    },
    UPDATE_THREAT_TERM_FROM: (state, action) => {
      const { threatUUID, uuid, from } = action.payload;
      const validParams = threatUUID && uuid && from;
      const isValidTerms = state.hasOwnProperty(threatUUID) && state[threatUUID].hasOwnProperty("terms") && state[threatUUID].terms.hasOwnProperty(uuid);

      if (validParams && isValidTerms) {
        state[threatUUID].terms[uuid].from = from;
      }
    },
    UPDATE_THREAT_TERM_CONSISTENCY_RATIONALE: (state, action) => {
      const { threatUUID, uuid, consistencyRationale } = action.payload;
      const validParams = threatUUID && uuid && consistencyRationale;
      const isValidTerms = state.hasOwnProperty(threatUUID) && state[threatUUID].hasOwnProperty("terms") && state[threatUUID].terms.hasOwnProperty(uuid);

      if (validParams && isValidTerms) {
        state[threatUUID].terms[uuid].consistencyRationale = consistencyRationale;
      }
    },
    UPDATE_THREAT_TERM_SFRS: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let sfrs = action.payload.sfrs;
      if (state.hasOwnProperty(threatUUID)) {
        if (state[threatUUID].terms.hasOwnProperty(uuid)) {
          state[threatUUID].terms[uuid].sfrs = sfrs;
        }
      }
    },
    DELETE_THREAT_TERM: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let title = action.payload.title;
      let uuid = action.payload.uuid;
      if (state.hasOwnProperty(threatUUID)) {
        if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === title) {
          delete state[threatUUID].terms[uuid];
        }
      }
      // Sort terms lists
      threatsSlice.caseReducers.SORT_THREATS_TERMS_LIST_HELPER(state);
    },
    DELETE_ALL_THREAT_TERMS: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let title = action.payload.title;
      if (state.hasOwnProperty(threatUUID) && state[threatUUID].title === title) {
        let terms = state[threatUUID].terms;
        if (terms && terms !== undefined) {
          state[threatUUID].terms = {};
        }
      }
    },
    COLLAPSE_THREAT_TERM: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let title = action.payload.title;
      let open = action.payload.open;
      if (state.hasOwnProperty(threatUUID)) {
        if (state[threatUUID].terms.hasOwnProperty(uuid) && state[threatUUID].terms[uuid].title === title) {
          let threat = state[threatUUID].terms[uuid];
          threat.open = open !== null && typeof open === "boolean" ? open : !threat.open;
        }
      }
    },
    ADD_THREAT_TERM_OBJECTIVE: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let objectiveUUID = action.payload.objectiveUUID;
      let rationale = action.payload.rationale ? action.payload.rationale : "";
      let originalTitle = action.payload.title;
      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;
        if (currentThreatList.hasOwnProperty(uuid) && currentThreatList[uuid].title === originalTitle) {
          let uuidExists = false;
          currentThreatList[uuid].objectives.map((objective) => {
            if (objective.uuid === objectiveUUID) {
              uuidExists = true;
            }
          });
          if (!uuidExists) {
            currentThreatList[uuid].objectives.push({ uuid: objectiveUUID, rationale: rationale });
          }
        }
      }
    },
    ADD_THREAT_TERM_SFR: (state, action) => {
      let { threatUUID, uuid, sfrUUID, rationale, title, sfrName } = action.payload;
      let currentRationale = rationale ? rationale : "";
      let objectiveUUID = action.payload.objectiveUUID ? action.payload.objectiveUUID : ""; // only present for non-CC2022 PP's

      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;

        if (currentThreatList.hasOwnProperty(uuid)) {
          let currentThreat = currentThreatList[uuid];
          let uuidExists = false;

          if (!currentThreat.hasOwnProperty("sfrs")) {
            currentThreat.sfrs = [];
          }

          if (currentThreat.title === title) {
            currentThreat.sfrs.map((sfr) => {
              if (objectiveUUID != "") {
                if (sfr.uuid === sfrUUID && objectiveUUID === sfr.objectiveUUID) {
                  uuidExists = true;
                }
              } else {
                if (sfr.uuid === sfrUUID) {
                  uuidExists = true;
                }
              }
            });

            if (!uuidExists) {
              currentThreat.sfrs.push({
                name: sfrName,
                uuid: sfrUUID,
                rationale: currentRationale,
                objectiveUUID: objectiveUUID,
              });
            }
          }
        }
      }
    },
    UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let objectiveUUID = action.payload.objectiveUUID;
      let newRationale = action.payload.newRationale;
      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;
        if (currentThreatList.hasOwnProperty(uuid)) {
          currentThreatList[uuid].objectives.map((objective) => {
            if (objective.uuid === objectiveUUID) {
              objective.rationale = newRationale;
            }
          });
        }
      }
    },
    UPDATE_THREAT_TERM_SFR_RATIONALE: (state, action) => {
      const { threatUUID, uuid, sfrUUID, prevRationale, newRationale } = action.payload;

      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;
        if (currentThreatList.hasOwnProperty(uuid)) {
          let currentThreat = currentThreatList[uuid];

          if (currentThreat.hasOwnProperty("sfrs")) {
            currentThreat.sfrs.map((sfr) => {
              if (sfr.uuid === sfrUUID) {
                sfr.rationale = sfr.rationale.replace(prevRationale, newRationale);
              }
            });
          } else {
            currentThreat.sfrs = [];
          }
        }
      }
    },
    DELETE_THREAT_TERM_OBJECTIVE: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let objectiveUUID = action.payload.objectiveUUID;
      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;
        if (currentThreatList.hasOwnProperty(uuid)) {
          currentThreatList[uuid].objectives.map((objective, index) => {
            if (objective.uuid === objectiveUUID) {
              currentThreatList[uuid].objectives.splice(index, 1);
            }
          });
        }
      }
    },
    DELETE_THREAT_TERM_SFR: (state, action) => {
      const { threatUUID, uuid, sfrUUID } = action.payload;
      let objectiveUUID = action.payload.objectiveUUID ? action.payload.objectiveUUID : ""; // only present for non-CC2022 PP's

      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;
        if (currentThreatList.hasOwnProperty(uuid)) {
          let currentThreat = currentThreatList[uuid];

          if (currentThreat.hasOwnProperty("sfrs")) {
            currentThreat.sfrs.map((sfr, index) => {
              if (objectiveUUID != "") {
                if (sfr.uuid === sfrUUID && sfr.objectiveUUID === objectiveUUID) {
                  currentThreat.sfrs.splice(index, 1);
                }
              } else {
                if (sfr.uuid === sfrUUID) {
                  currentThreat.sfrs.splice(index, 1);
                }
              }
            });
          } else {
            currentThreat.sfrs = [];
          }
        }
      }
    },
    COLLAPSE_THREAT_RATIONALE_TABLE: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let originalTitle = action.payload.title;
      if (state.hasOwnProperty(threatUUID)) {
        let currentThreatList = state[threatUUID].terms;
        if (currentThreatList.hasOwnProperty(uuid) && currentThreatList[uuid].title === originalTitle) {
          let threat = state[threatUUID].terms[uuid];
          threat.tableOpen = !threat.tableOpen;
        }
      }
    },
    DELETE_OBJECTIVE_FROM_THREAT_USING_UUID: (state, action) => {
      const { objectiveUUID } = action.payload;
      Object.values(state).map((value) => {
        let threats = value.hasOwnProperty("terms") ? value.terms : {};
        Object.values(threats).map((threat) => {
          let objectives = threat.hasOwnProperty("objectives") ? threat.objectives : [];
          if (objectives && objectives.length > 0) {
            objectives.map((objective, index) => {
              const { uuid } = objective;
              if (uuid && uuid === objectiveUUID) {
                objectives.splice(index, 1);
              }
            });
          }
        });
      });
    },
    RESET_ALL_THREAT_TERM_OBJECTIVES: (state) => {
      Object.values(state).forEach((parent) => {
        let { title, terms } = parent;
        if (title && title === "Threats" && terms && Object.keys(terms).length > 0) {
          Object.values(terms).forEach((term) => {
            term.objectives = [];
          });
        }
      });
    },
    DELETE_SFR_FROM_THREAT_USING_UUID: (state, action) => {
      const { sfrUUID } = action.payload;

      Object.values(state).map((value) => {
        let threats = value.hasOwnProperty("terms") ? value.terms : {};

        Object.values(threats).map((threat) => {
          let sfrs = threat.hasOwnProperty("sfrs") ? threat.sfrs : [];

          if (sfrs && sfrs.length > 0) {
            sfrs.map((sfr, index) => {
              const { uuid } = sfr;

              if (uuid && uuid === sfrUUID) {
                sfrs.splice(index, 1);
              }
            });
          }
        });
      });
    },
    SORT_THREATS_TERMS_LIST_HELPER: (state) => {
      Object.entries(state).map(([key, value]) => {
        if (value.terms && Object.entries(value.terms).length > 0) {
          let sorted = Object.entries(value.terms).sort((a, b) => {
            const nameA = a[1].title.toUpperCase();
            const nameB = b[1].title.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            // names must be equal
            return 0;
          });
          value.terms = Object.fromEntries(sorted);
        }
      });
    },
    SORT_OBJECTIVES_FROM_THREATS_HELPER: (state, action) => {
      let threatUUID = action.payload.threatUUID;
      let uuid = action.payload.uuid;
      let uuidMap = action.payload.uuidMap;
      let objectives = state[threatUUID].terms[uuid].objectives;
      objectives.sort((a, b) => {
        const nameA = uuidMap[a.uuid].toUpperCase();
        const nameB = uuidMap[b.uuid].toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    },
    SORT_SFR_FROM_THREATS_HELPER: (state, action) => {
      let { threatUUID, uuid, uuidMap } = action.payload;
      try {
        const isValid = state[threatUUID] && state[threatUUID].hasOwnProperty("terms") && state[threatUUID].terms.hasOwnProperty(uuid);

        if (isValid) {
          const isSfr = state[threatUUID].terms[uuid].hasOwnProperty("sfrs");

          if (isSfr) {
            let sfrs = state[threatUUID].terms[uuid].sfrs;

            sfrs?.sort((a, b) => {
              const nameA = uuidMap[a.uuid] ? uuidMap[a.uuid].toUpperCase() : "";
              const nameB = uuidMap[b.uuid] ? uuidMap[b.uuid].toUpperCase() : "";
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              // names must be equal
              return 0;
            });
          } else {
            state[threatUUID].terms[uuid].sfrs = [];
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    SET_THREATS_INITIAL_STATE: (state, action) => {
      try {
        return {
          ...action.payload,
        };
      } catch (e) {
        console.log(e);
      }
    },
    RESET_THREATS_STATE: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  UPDATE_MAIN_SECURITY_PROBLEM_DEFINITION,
  CREATE_THREAT_SECTION,
  UPDATE_THREAT_SECTION_TITLE,
  UPDATE_THREAT_SECTION_DEFINITION,
  DELETE_THREAT_SECTION,
  COLLAPSE_THREAT_SECTION,
  CREATE_THREAT_TERM,
  UPDATE_THREAT_TERM_TITLE,
  UPDATE_THREAT_TERM_DEFINITION,
  UPDATE_THREAT_TERM_FROM,
  UPDATE_THREAT_TERM_CONSISTENCY_RATIONALE,
  UPDATE_THREAT_TERM_SFRS,
  DELETE_THREAT_TERM,
  DELETE_ALL_THREAT_TERMS,
  COLLAPSE_THREAT_TERM,
  ADD_THREAT_TERM_OBJECTIVE,
  ADD_THREAT_TERM_SFR,
  UPDATE_THREAT_TERM_OBJECTIVE_RATIONALE,
  UPDATE_THREAT_TERM_SFR_RATIONALE,
  DELETE_THREAT_TERM_OBJECTIVE,
  DELETE_THREAT_TERM_SFR,
  COLLAPSE_THREAT_RATIONALE_TABLE,
  DELETE_OBJECTIVE_FROM_THREAT_USING_UUID,
  RESET_ALL_THREAT_TERM_OBJECTIVES,
  DELETE_SFR_FROM_THREAT_USING_UUID,
  SORT_THREATS_TERMS_LIST_HELPER,
  SORT_OBJECTIVES_FROM_THREATS_HELPER,
  SORT_SFR_FROM_THREATS_HELPER,
  SET_THREATS_INITIAL_STATE,
  RESET_THREATS_STATE,
} = threatsSlice.actions;

export default threatsSlice.reducer;

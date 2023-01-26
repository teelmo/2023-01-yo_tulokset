import React, { useEffect, useState, useRef } from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/uuid
import { v4 as uuidv4 } from 'uuid';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';
import Subjects from './helpers/Subjects.js';
import Names from './helpers/Names.js';

function App() {
  const appRef = useRef();
  const [data, setData] = useState(false);
  const [currentSchoolData, setCurrentSchoolData] = useState(false);
  const [currentCompareData, setCurrentCompareData] = useState(false);
  const [schools, setSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(false);
  const [selectedCompare, setSelectedCompare] = useState(false);

  useEffect(() => {
    const getDataPath = () => {
      if (window.location.href.includes('github')) return './assets/data/';
      if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2023-01-yo_tulokset/assets/data/';
      return 'assets/data';
    };

    try {
      Promise.all([
        fetch(`${getDataPath()}/2023-01-yo_tulokset_2022_data.csv`)
          .then((response) => {
            if (!response.ok) {
              throw Error(response.statusText);
            }
            return response.text();
          })
          .then(body => setData(CSVtoJSON(body))),

      ]);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (data !== false) {
      setSchools([...new Set(data.map(el => el.koulun_nimi))].sort());
      appRef.current.querySelector('.search input').removeAttribute('disabled');
    }
  }, [data]);

  const defineData = (event) => {
    const schoolData = {
      syksy2022: {},
      kevat2022: {},
    };
    data.filter(el => el.koulun_nimi === event.target.value).map(el => {
      if (el.tutkintokerta === '2022S') {
        Subjects.map(subject => {
          if (el[subject] !== '') {
            if (!schoolData.syksy2022[subject]) {
              schoolData.syksy2022[subject] = {};
            }
            if (schoolData.syksy2022[subject][el[subject]]) {
              schoolData.syksy2022[subject][el[subject]] += 1;
            } else {
              schoolData.syksy2022[subject][el[subject]] = 1;
            }
          }
          return true;
        });
      }
      if (el.tutkintokerta === '2022K') {
        Subjects.map(subject => {
          if (el[subject] !== '') {
            if (!schoolData.kevat2022[subject]) {
              schoolData.kevat2022[subject] = {};
            }
            if (schoolData.kevat2022[subject][el[subject]]) {
              schoolData.kevat2022[subject][el[subject]] += 1;
            } else {
              schoolData.kevat2022[subject][el[subject]] = 1;
            }
          }
          return true;
        });
      }
      return true;
    });
    return schoolData;
  };

  const changeSchool = (event) => {
    if (schools.includes(event.target.value)) {
      appRef.current.querySelector('.compare').style.display = 'flex';
      setSelectedSchool(event.target.value);

      setCurrentSchoolData(defineData(event));
    } else {
      appRef.current.querySelector('.compare').style.display = 'none';
    }
  };

  const changeCompare = (event) => {
    if (schools.includes(event.target.value)) {
      setSelectedCompare(event.target.value);
      setCurrentCompareData(defineData(event));
    }
  };

  return (
    <div className="app" ref={appRef}>
      <h2>Katso, miten arvosanat jakautuivat oppiaineittain lukiossasi</h2>
      <p>Assassin stimulate cardboard denim girl alcohol neural RAF 8-bit BASE jump refrigerator military-grade narrative soul-delay otaku tower. Boat DIY alcohol monofilament dome knife courier smart-corrupted otaku stimulate motion advert beef noodles fetishism soul-delay. Realism corporation stimulate voodoo god San Francisco neural man office claymore mine uplink. Drone spook soul-delay office woman dead uplink dolphin fetishism tiger-team nodality jeans meta-long-chain hydrocarbons otaku boy range-rover. Cardboard shoes dissident into lights knife disposable rain media tower geodesic. Papier-mache hotdog hacker augmented reality tattoo carbon motion A.I. stimulate disposable ablative katana weathered 3D-printed free-market monofilament camera.</p>
      <div className="search_container">
        <div className="search">
          <span className="icon icon_search" />
          <input list="app_schools" type="text" placeholder="Hae lukion nimellä" disabled onChange={(event) => changeSchool(event)} />
        </div>
        <div className="compare">
          <span className="icon icon_compare" />
          <input list="app_schools" type="text" placeholder="Vertaa haluamaasi lukioon" onChange={(event) => changeCompare(event)} />
        </div>
        <datalist id="app_schools">
          {schools && schools.map(municipality => (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <option key={municipality} value={municipality} />
          ))}
        </datalist>
      </div>
      {
        selectedSchool && (
          <div className="results_container">
            <h3>{selectedSchool}</h3>
            {
              Subjects.map((subject) => (
                (currentSchoolData.kevat2022[subject] || currentSchoolData.syksy2022[subject] || currentCompareData.kevat2022?.[subject] || currentCompareData.syksy2022?.[subject]) && (
                <div key={uuidv4()} className="subject_container">
                  <h4>
                    {Names[subject].charAt(0).toUpperCase() + Names[subject].slice(1)}
                  </h4>
                  <div className="results">
                    <div className="header_row">
                      <span className="first" />
                      <span>I</span>
                      <span>A</span>
                      <span>B</span>
                      <span>C</span>
                      <span>M</span>
                      <span>E</span>
                      <span>L</span>
                    </div>
                    <div className="results_row">
                      <span className="first">kevät 2022</span>
                      {
                      [0, 2, 3, 4, 5, 6, 7].map(grade => (
                        <span key={uuidv4()}>{currentSchoolData.kevat2022[subject]?.[grade]}</span>
                      ))
                    }
                    </div>
                    <div className="results_row">
                      <span className="first">syksy 2022</span>
                      {
                        [0, 2, 3, 4, 5, 6, 7].map(grade => (
                          <span key={uuidv4()}>{currentSchoolData.syksy2022[subject]?.[grade]}</span>
                        ))
                    }
                    </div>
                    {
                      currentCompareData && (
                        <div className="compare_results">
                          <h4>{selectedCompare}</h4>
                          <div className="results_row">
                            <span className="first">kevät 2022</span>
                            {
                              [0, 2, 3, 4, 5, 6, 7].map(grade => (
                                <span key={uuidv4()}>{currentCompareData.kevat2022[subject]?.[grade]}</span>
                              ))
                            }
                          </div>
                          <div className="results_row">
                            <span className="first">syksy 2022</span>
                            {
                              [0, 2, 3, 4, 5, 6, 7].map(grade => (
                                <span key={uuidv4()}>{currentCompareData.syksy2022[subject]?.[grade]}</span>
                              ))
                            }
                          </div>

                        </div>
                      )
                    }
                  </div>
                </div>
                )
              ))
            }
          </div>
        )
      }
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;

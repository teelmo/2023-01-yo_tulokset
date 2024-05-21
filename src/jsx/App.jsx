import React, {
  useEffect, useState, useRef, useCallback
} from 'react';
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
  const [countryData, setCountryData] = useState(false);

  useEffect(() => {
    const getDataPath = () => {
      if (window.location.href.includes('github')) return './assets/data/';
      if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2023-01-yo_tulokset/assets/data';
      return 'assets/data';
    };

    try {
      Promise.all([
        fetch(`${getDataPath()}/2023-01-yo_tulokset_data.csv`)
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

  const defineData = useCallback((event, all = false) => {
    const schoolData = {
      syksy2022: {},
      kevat2023: {},
      syksy2023: {},
      kevat2024: {}
    };
    data.filter(el => el.koulun_nimi === event.target?.value || all === true).map(el => {
      if (el.tutkintokerta === '2022S') {
        Subjects.map(subject => {
          if (el[subject] !== '') {
            if (!schoolData.syksy2022[subject]) {
              schoolData.syksy2022[subject] = { total: 0 };
            }
            if (schoolData.syksy2022[subject][el[subject]]) {
              schoolData.syksy2022[subject][el[subject]] += 1;
            } else {
              schoolData.syksy2022[subject][el[subject]] = 1;
            }
            schoolData.syksy2022[subject].total++;
          }
          return true;
        });
      }
      if (el.tutkintokerta === '2023K') {
        Subjects.map(subject => {
          if (el[subject] !== '') {
            if (!schoolData.kevat2023[subject]) {
              schoolData.kevat2023[subject] = { total: 0 };
            }
            if (schoolData.kevat2023[subject][el[subject]]) {
              schoolData.kevat2023[subject][el[subject]] += 1;
            } else {
              schoolData.kevat2023[subject][el[subject]] = 1;
            }
            schoolData.kevat2023[subject].total++;
          }
          return true;
        });
      }
      if (el.tutkintokerta === '2023S') {
        Subjects.map(subject => {
          if (el[subject] !== '') {
            if (!schoolData.syksy2023[subject]) {
              schoolData.syksy2023[subject] = { total: 0 };
            }
            if (schoolData.syksy2023[subject][el[subject]]) {
              schoolData.syksy2023[subject][el[subject]] += 1;
            } else {
              schoolData.syksy2023[subject][el[subject]] = 1;
            }
            schoolData.syksy2023[subject].total++;
          }
          return true;
        });
      }

      if (el.tutkintokerta === '2024K') {
        Subjects.map(subject => {
          if (el[subject] !== '') {
            if (!schoolData.kevat2024[subject]) {
              schoolData.kevat2024[subject] = { total: 0 };
            }
            if (schoolData.kevat2024[subject][el[subject]]) {
              schoolData.kevat2024[subject][el[subject]] += 1;
            } else {
              schoolData.kevat2024[subject][el[subject]] = 1;
            }
            schoolData.kevat2024[subject].total++;
          }
          return true;
        });
      }
      return true;
    });
    return schoolData;
  }, [data]);

  useEffect(() => {
    if (data !== false) {
      setSchools([...new Set(data.map(el => el.koulun_nimi))].sort());
      setCountryData(defineData(false, true));
      appRef.current.querySelector('.search input').removeAttribute('disabled');
    }
  }, [data, defineData]);

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
      <p>Kirjoita hakukenttään oman lukiosi nimi ja katso, miten arvosanat jakautuivat lukiossasi syksyllä ja keväällä. Halutessasi voit verrata arvosanoja toiseen lukioon kirjoittamalla lukion nimen alimmaiseen hakukenttään.</p>
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
                (currentSchoolData.syksy2022[subject] || currentSchoolData.kevat2023[subject] || currentSchoolData.syksy2023[subject] || currentSchoolData.kevat2024[subject] || currentCompareData.syksy2022?.[subject] || currentCompareData.kevat2023?.[subject] || currentCompareData.syksy2023?.[subject] || currentCompareData.kevat2024?.[subject]) && (
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
                      <span className="last">yht.</span>
                    </div>
                    <div className="results_row">
                      <span className="first">syksy 2022</span>
                      {
                        [0, 2, 3, 4, 5, 6, 7].map(grade => (
                          <span key={uuidv4()}>{currentSchoolData.syksy2022[subject]?.total < 5 ? '' : currentSchoolData.syksy2022[subject]?.[grade] ? currentSchoolData.syksy2022[subject]?.[grade] : '0'}</span>
                        ))
                      }
                      <span>{currentSchoolData.syksy2022[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentSchoolData.syksy2022[subject]?.total ? currentSchoolData.syksy2022[subject]?.total : '0'}</span>
                    </div>
                    <div className="results_row">
                      <span className="first">kevät 2023</span>
                      {
                        [0, 2, 3, 4, 5, 6, 7].map(grade => (
                          <span key={uuidv4()}>{currentSchoolData.kevat2023[subject]?.total < 5 ? '' : currentSchoolData.kevat2023[subject]?.[grade] ? currentSchoolData.kevat2023[subject]?.[grade] : '0'}</span>
                        ))
                      }
                      <span>{currentSchoolData.kevat2023[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentSchoolData.kevat2023[subject]?.total ? currentSchoolData.kevat2023[subject]?.total : '0'}</span>
                    </div>
                    <div className="results_row">
                      <span className="first">syksy 2023</span>
                      {
                        [0, 2, 3, 4, 5, 6, 7].map(grade => (
                          <span key={uuidv4()}>{currentSchoolData.syksy2023[subject]?.total < 5 ? '' : currentSchoolData.syksy2023[subject]?.[grade] ? currentSchoolData.syksy2023[subject]?.[grade] : '0'}</span>
                        ))
                      }
                      <span>{currentSchoolData.syksy2023[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentSchoolData.syksy2023[subject]?.total ? currentSchoolData.syksy2023[subject]?.total : '0'}</span>
                    </div>
                    <div className="results_row">
                      <span className="first">kevät 2024</span>
                      {
                        [0, 2, 3, 4, 5, 6, 7].map(grade => (
                          <span key={uuidv4()}>{currentSchoolData.kevat2024[subject]?.total < 5 ? '' : currentSchoolData.kevat2024[subject]?.[grade] ? currentSchoolData.kevat2024[subject]?.[grade] : '0'}</span>
                        ))
                      }
                      <span>{currentSchoolData.kevat2024[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentSchoolData.kevat2024[subject]?.total ? currentSchoolData.kevat2024[subject]?.total : '0'}</span>
                    </div>
                    {
                      currentCompareData && (
                        <div className="compare_results">
                          <h4>{selectedCompare}</h4>
                          <div className="results_row">
                            <span className="first">syksy 2022</span>
                            {
                              [0, 2, 3, 4, 5, 6, 7].map(grade => (
                                <span key={uuidv4()}>{currentCompareData.syksy2022[subject]?.total < 5 ? '' : currentCompareData.syksy2022[subject]?.[grade] ? currentCompareData.syksy2022[subject]?.[grade] : '0'}</span>
                              ))
                            }
                            <span>{currentCompareData.syksy2022[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentCompareData.syksy2022[subject]?.total ? currentCompareData.syksy2022[subject]?.total : '0'}</span>
                          </div>
                          <div className="results_row">
                            <span className="first">kevät 2023</span>
                            {
                              [0, 2, 3, 4, 5, 6, 7].map(grade => (
                                <span key={uuidv4()}>{currentCompareData.kevat2023[subject]?.total < 5 ? '' : currentCompareData.kevat2023[subject]?.[grade] ? currentCompareData.kevat2023[subject]?.[grade] : '0'}</span>
                              ))
                            }
                            <span>{currentCompareData.kevat2023[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentCompareData.kevat2023[subject]?.total ? currentCompareData.kevat2023[subject]?.total : '0'}</span>
                          </div>
                          <div className="results_row">
                            <span className="first">syksy 2023</span>
                            {
                              [0, 2, 3, 4, 5, 6, 7].map(grade => (
                                <span key={uuidv4()}>{currentCompareData.syksy2023[subject]?.total < 5 ? '' : currentCompareData.syksy2023[subject]?.[grade] ? currentCompareData.syksy2023[subject]?.[grade] : '0'}</span>
                              ))
                            }
                            <span>{currentCompareData.syksy2023[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentCompareData.syksy2023[subject]?.total ? currentCompareData.syksy2023[subject]?.total : '0'}</span>
                          </div>
                          <div className="results_row">
                            <span className="first">kevät 2024</span>
                            {
                              [0, 2, 3, 4, 5, 6, 7].map(grade => (
                                <span key={uuidv4()}>{currentCompareData.kevat2024[subject]?.total < 5 ? '' : currentCompareData.kevat2024[subject]?.[grade] ? currentCompareData.kevat2024[subject]?.[grade] : '0'}</span>
                              ))
                            }
                            <span>{currentCompareData.kevat2024[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : currentCompareData.kevat2024[subject]?.total ? currentCompareData.kevat2024[subject]?.total : '0'}</span>
                          </div>
                        </div>
                      )
                    }
                    <div className="country_results">
                      <h5>koko Suomi</h5>
                      <div className="results_row">
                        <span className="first">syksy 2022</span>
                        {
                          [0, 2, 3, 4, 5, 6, 7].map(grade => (
                            <span key={uuidv4()}>{countryData.syksy2022[subject]?.total < 5 ? '' : countryData.syksy2022[subject]?.[grade]}</span>
                          ))
                        }
                        <span>{countryData.syksy2022[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : countryData.syksy2022[subject]?.total}</span>
                      </div>
                      <div className="results_row">
                        <span className="first">kevät 2023</span>
                        {
                          [0, 2, 3, 4, 5, 6, 7].map(grade => (
                            <span key={uuidv4()}>{countryData.kevat2023[subject]?.total < 5 ? '' : countryData.kevat2023[subject]?.[grade]}</span>
                          ))
                        }
                        <span>{countryData.kevat2023[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : countryData.kevat2023[subject]?.total}</span>
                      </div>
                      <div className="results_row">
                        <span className="first">syksy 2023</span>
                        {
                          [0, 2, 3, 4, 5, 6, 7].map(grade => (
                            <span key={uuidv4()}>{countryData.syksy2023[subject]?.total < 5 ? '' : countryData.syksy2023[subject]?.[grade]}</span>
                          ))
                        }
                        <span>{countryData.syksy2023[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : countryData.syksy2023[subject]?.total}</span>
                      </div>
                      <div className="results_row">
                        <span className="first">kevät 2024</span>
                        {
                          [0, 2, 3, 4, 5, 6, 7].map(grade => (
                            <span key={uuidv4()}>{countryData.kevat2024[subject]?.total < 5 ? '' : countryData.kevat2024[subject]?.[grade]}</span>
                          ))
                        }
                        <span>{countryData.kevat2024[subject]?.total < 5 ? <span className="anonymised">&lt;5</span> : countryData.kevat2024[subject]?.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
                )
              ))
            }
            <p>
              Tiedot haettu
              {' '}
              <a href="https://www.ylioppilastutkinto.fi/fi/tietopalvelut/tilastot/oppilaitoskohtaisia-tunnuslukuja" target="_blank" rel="noreferrer">YTL</a>
              :ltä 21.05.2024.
            </p>
          </div>
        )
      }
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;

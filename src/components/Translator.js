import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Translator.css";
import Footer from "./Footer";

const Translator = () => {
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const cachedLanguages = localStorage.getItem("cachedLanguages");
        if (cachedLanguages) {
          setLanguages(JSON.parse(cachedLanguages));
        } else {
          const languageOptions = {
            method: "GET",
            url: "https://text-translator2.p.rapidapi.com/getLanguages",
            headers: {
              "X-RapidAPI-Key":
                "6475c3a0a4msh871ad53b97eca38p1bcdb3jsn620f60ed32bd",
              "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
            },
          };

          const response = await axios.request(languageOptions);
          const languagesData = response.data.data.languages;
          setLanguages(languagesData);
          localStorage.setItem(
            "cachedLanguages",
            JSON.stringify(languagesData)
          );
        }
      } catch (error) {
        setError("Error fetching languages");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const translateText = async () => {
    setLoading(true);
    setError(null);

    const encodedParams = new URLSearchParams();
    encodedParams.set("source_language", sourceLanguage);
    encodedParams.set("target_language", targetLanguage);
    encodedParams.set("text", inputText);

    const translationOptions = {
      method: "POST",
      url: "https://text-translator2.p.rapidapi.com/translate",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": "6475c3a0a4msh871ad53b97eca38p1bcdb3jsn620f60ed32bd",
        "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
      },
      data: encodedParams,
    };

    try {
      const response = await axios.request(translationOptions);
      const prettifiedText = JSON.parse(
        `"${response.data.data.translatedText}"`
      );
      setTranslatedText(prettifiedText);
    } catch (error) {
      setError("Translation error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    alert("Translated text copied to clipboard!");
  };

  const clearFields = () => {
    setSourceLanguage("");
    setTargetLanguage("");
    setInputText("");
    setTranslatedText("");
  };

  const isTranslateDisabled = !sourceLanguage || !targetLanguage || !inputText;
  const isCopyDisabled = !translatedText;
  const isClearDisabled = !sourceLanguage && !targetLanguage && !inputText;

  return (
    <div className="translator-container">
      <h1>Language Translator</h1>
      {loading && <div className="loader">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
        <>
          <div>
            <label>
              Source Language:
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
              >
                <option value="">Select Language</option>
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Convert Language:
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                <option value="">Select Convert Language</option>
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Text:
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </label>
          </div>
          <div className="button-group">
            <button onClick={translateText} disabled={isTranslateDisabled}>
              Translate
            </button>
            <button onClick={clearFields} disabled={isClearDisabled}>
              Clear
            </button>
          </div>
          <div
            className={`translated-text-container ${
              translatedText ? "bordered" : ""
            }`}
          >
            <h3>Translated Text:</h3>
            <p>{translatedText}</p>
            <button
              className="copy-button"
              onClick={copyToClipboard}
              disabled={isCopyDisabled}
            >
              Copy
            </button>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Translator;

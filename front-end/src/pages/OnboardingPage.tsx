// front-end/src/pages/OnboardingPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";
import TopBar from "../components/TopBar";

import "./OnboardingPage.css";

type Gender = "man" | "woman" | "beyond_binary" | "other";
type InterestedIn = "men" | "women" | "everyone" | "beyond_binary";

const MAX_INTERESTS = 10;

const allInterests: { group: string; items: string[] }[] = [
  {
    group: "Social & content",
    items: [
      "Instagram", "YouTube", "TikTok", "Podcasts", "Vlogging", "Social Media",
      "Memes", "Netflix",
    ],
  },
  {
    group: "Sports & fitness",
    items: [
      "Gym", "Running", "Cricket", "Football", "Badminton", "Tennis",
      "Basketball", "Cycling", "Swimming",
    ],
  },
  {
    group: "Music",
    items: [
      "Rock", "Pop", "Hip Hop", "EDM", "Bollywood", "Classical", "Indie",
    ],
  },
  {
    group: "Food & drink",
    items: [
      "Biryani", "Street Food", "Coffee", "Tea", "Desserts", "Cocktails",
      "Mocktails",
    ],
  },
];

const relationshipGoals = [
  "Long-term partner",
  "Short-term fun",
  "New friends",
  "Still figuring it out",
];

const drinkingOptions = [
  "Not for me",
  "Sober",
  "On special occasions",
  "Socially on weekends",
  "Most nights",
];

const smokingOptions = [
  "Non-smoker",
  "Social smoker",
  "Smoker when drinking",
  "Trying to quit",
];

const workoutOptions = ["Everyday", "Often", "Sometimes", "Never"];

const petsOptions = [
  "Dog",
  "Cat",
  "Other pets",
  "Pet-free",
  "Want a pet",
  "All the pets",
];

const educationLevels = [
  "High school",
  "In college",
  "Bachelors",
  "Masters",
  "PhD",
  "Trade school",
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);

  // step 1 – basic
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("man");
  const [showGenderOnProfile, setShowGenderOnProfile] = useState(false);

  const [interestedIn, setInterestedIn] = useState<InterestedIn>("women");

  // step 2 – distance + goals
  const [distanceKm, setDistanceKm] = useState(50);
  const [lookingFor, setLookingFor] = useState<string>("Long-term partner");

  // step 3 – interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // step 4 – lifestyle + edu
  const [drinking, setDrinking] = useState<string | null>(null);
  const [smoking, setSmoking] = useState<string | null>(null);
  const [workout, setWorkout] = useState<string | null>(null);
  const [pets, setPets] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleInterest = (item: string) => {
    setSelectedInterests((current) => {
      const exists = current.includes(item);
      if (exists) {
        return current.filter((i) => i !== item);
      }
      if (current.length >= MAX_INTERESTS) return current;
      return [...current, item];
    });
  };

  const handleNext = () => {
    // very light validation per step
    if (step === 1) {
      if (!firstName.trim() || !birthDate) {
        setErrorMsg("Please fill your name and birthday.");
        return;
      }
    }
    if (step === 3) {
      if (selectedInterests.length === 0) {
        setErrorMsg("Choose at least one interest.");
        return;
      }
    }
    setErrorMsg(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    if (!drinking || !smoking || !workout || !pets || !educationLevel) {
      setErrorMsg("Please answer all lifestyle and education questions.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const ref = doc(db, "users", user.uid);

      await setDoc(
        ref,
        {
          firstName: firstName.trim(),
          birthDate,
          gender,
          showGenderOnProfile,
          interestedIn,
          distanceKm,
          lookingFor,
          interests: selectedInterests,
          lifestyle: {
            drinking,
            smoking,
            workout,
            pets,
          },
          education: {
            level: educationLevel,
            schoolName: schoolName.trim() || null,
          },
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      navigate("/");
    } catch (err) {
      console.error("Error saving onboarding:", err);
      setErrorMsg("Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="ob-title">What’s your basic info?</h1>

            <label className="ob-label">
              First name
              <input
                className="ob-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Dev"
              />
            </label>

            <label className="ob-label">
              Birthday
              <input
                type="date"
                className="ob-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>

            <div className="ob-block">
              <div className="ob-subtitle">Gender</div>
              <div className="ob-chip-row">
                {[
                  { key: "man", label: "Man" },
                  { key: "woman", label: "Woman" },
                  { key: "beyond_binary", label: "Beyond binary" },
                  { key: "other", label: "Other" },
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className={
                      "ob-chip" + (gender === g.key ? " ob-chip--active" : "")
                    }
                    onClick={() => setGender(g.key as Gender)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <label className="ob-checkbox">
                <input
                  type="checkbox"
                  checked={showGenderOnProfile}
                  onChange={(e) => setShowGenderOnProfile(e.target.checked)}
                />
                <span>Show gender on profile</span>
              </label>
            </div>

            <div className="ob-block">
              <div className="ob-subtitle">Who are you interested in seeing?</div>
              <div className="ob-chip-row">
                {[
                  { key: "men", label: "Men" },
                  { key: "women", label: "Women" },
                  { key: "everyone", label: "Everyone" },
                  { key: "beyond_binary", label: "Beyond binary" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={
                      "ob-chip" +
                      (interestedIn === opt.key ? " ob-chip--active" : "")
                    }
                    onClick={() => setInterestedIn(opt.key as InterestedIn)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h1 className="ob-title">Your preferences</h1>

            <div className="ob-block">
              <div className="ob-subtitle">
                Distance preference: {distanceKm} km
              </div>
              <input
                type="range"
                min={5}
                max={160}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="ob-slider"
              />
              <p className="ob-help-text">
                You can change this later in Settings.
              </p>
            </div>

            <div className="ob-block">
              <div className="ob-subtitle">What are you looking for?</div>
              <div className="ob-chip-row">
                {relationshipGoals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={
                      "ob-chip" + (lookingFor === g ? " ob-chip--active" : "")
                    }
                    onClick={() => setLookingFor(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h1 className="ob-title">What are you into?</h1>
            <p className="ob-help-text">
              Add up to {MAX_INTERESTS} interests to help us show you better matches.
            </p>
            <p className="ob-help-text">
              Selected: {selectedInterests.length}/{MAX_INTERESTS}
            </p>

            {allInterests.map((group) => (
              <div key={group.group} className="ob-block">
                <div className="ob-subtitle">{group.group}</div>
                <div className="ob-chip-row">
                  {group.items.map((item) => {
                    const active = selectedInterests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        className={"ob-chip" + (active ? " ob-chip--active" : "")}
                        onClick={() => toggleInterest(item)}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        );

      case 4:
      default:
        return (
          <>
            <h1 className="ob-title">Lifestyle & education</h1>

            <div className="ob-block">
              <div className="ob-subtitle">How often do you drink?</div>
              <div className="ob-chip-row">
                {drinkingOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={
                      "ob-chip" + (drinking === opt ? " ob-chip--active" : "")
                    }
                    onClick={() => setDrinking(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-block">
              <div className="ob-subtitle">How often do you smoke?</div>
              <div className="ob-chip-row">
                {smokingOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={
                      "ob-chip" + (smoking === opt ? " ob-chip--active" : "")
                    }
                    onClick={() => setSmoking(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-block">
              <div className="ob-subtitle">Do you workout?</div>
              <div className="ob-chip-row">
                {workoutOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={
                      "ob-chip" + (workout === opt ? " ob-chip--active" : "")
                    }
                    onClick={() => setWorkout(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-block">
              <div className="ob-subtitle">Do you have any pets?</div>
              <div className="ob-chip-row">
                {petsOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={
                      "ob-chip" + (pets === opt ? " ob-chip--active" : "")
                    }
                    onClick={() => setPets(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-block">
              <div className="ob-subtitle">What is your education level?</div>
              <div className="ob-chip-row">
                {educationLevels.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={
                      "ob-chip" +
                      (educationLevel === opt ? " ob-chip--active" : "")
                    }
                    onClick={() => setEducationLevel(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <label className="ob-label">
              School / college (optional)
              <input
                className="ob-input"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter school name"
              />
            </label>
          </>
        );
    }
  };

  const isLastStep = step === 4;

  return (
    <div className="app-shell ob-shell">
      <TopBar isLoggedIn={true} />

      <main className="ob-main">
        <div className="ob-card">
          <div className="ob-progress-bar">
            <div
              className="ob-progress-bar-fill"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {renderStep()}

          {errorMsg && <p className="ob-error">{errorMsg}</p>}

          <div className="ob-footer">
            {step > 1 ? (
              <button type="button" className="ob-secondary-btn" onClick={handleBack}>
                Back
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              className="ob-primary-btn"
              onClick={isLastStep ? handleFinish : handleNext}
              disabled={saving}
            >
              {saving ? "Saving..." : isLastStep ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;

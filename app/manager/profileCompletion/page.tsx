"use client"

import { useState } from "react"
import { Upload, User, Building, Globe, Star } from "lucide-react"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import styles from "../../../styling/profileForm.module.css"
import API_ROUTES from "../../apiRoutes";

interface ManagerData {
  phone: string
  department: string
  status: string
  profilePhoto: string
  website: string
  socialMedia: {
    linkedin: string
    facebook: string
    twitter: string
    instagram: string
  }
  experience: number
  rating: number
}

export default function CreateManagerProfilePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [managerData, setManagerData] = useState<ManagerData>({
    phone: "",
    department: "",
    status: "active",
    profilePhoto: "",
    website: "",
    socialMedia: {
      linkedin: "",
      facebook: "",
      twitter: "",
      instagram: "",
    },
    experience: 0,
    rating: 0,
  })
  const [isSelectOpen, setIsSelectOpen] = useState({
    department: false,
    status: false,
    experience: false,
  })

  const updateManagerData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setManagerData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ManagerData],
          [child]: value,
        },
      }))
    } else {
      setManagerData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
  try {
    const res = await fetch(API_ROUTES.MANAGERS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(managerData),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      console.log("Manager profile created:", data.data); // Redirect to dashboard or home
    } else {
      console.error("Failed to create manager profile:", data.message || data);
      // Optionally show error to user
    }
  } catch (error) {
    console.error("Error submitting manager profile:", error);
    // Optionally show error to user
  }
};

  const handleSelectToggle = (selectType: keyof typeof isSelectOpen) => {
    setIsSelectOpen((prev) => ({
      ...prev,
      [selectType]: !prev[selectType],
    }))
  }

  const handleSelectOption = (selectType: keyof typeof isSelectOpen, value: string, field: string) => {
    updateManagerData(field, value)
    setIsSelectOpen((prev) => ({
      ...prev,
      [selectType]: false,
    }))
  }

  const renderProgressBar = () => (
    <div className={styles.progressContainer}>
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className={styles.progressStepContainer}>
          <div
            className={`${styles.progressStep} ${currentStep >= step ? styles.active : ""} ${
              currentStep > step ? styles.completed : ""
            }`}
          >
            {currentStep > step ? <Check size={16} /> : step}
          </div>
          {step < 4 && <div className={`${styles.progressLine} ${currentStep > step ? styles.completed : ""}`} />}
        </div>
      ))}
    </div>
  )

  const renderCustomSelect = (
    options: { value: string; label: string }[],
    placeholder: string,
    selectType: keyof typeof isSelectOpen,
    field: string,
    currentValue: string | number,
  ) => (
    <div className={styles.customSelectContainer}>
      <div
        className={`${styles.customSelectTrigger} ${isSelectOpen[selectType] ? styles.open : ""}`}
        onClick={() => handleSelectToggle(selectType)}
      >
        <span className={currentValue ? "" : styles.placeholder}>
          {currentValue ? options.find((opt) => opt.value === currentValue.toString())?.label : placeholder}
        </span>
        <ChevronRight className={`${styles.selectArrow} ${isSelectOpen[selectType] ? styles.rotated : ""}`} size={16} />
      </div>
      {isSelectOpen[selectType] && (
        <div className={styles.customSelectDropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.customSelectOption} ${currentValue.toString() === option.value ? styles.selected : ""}`}
              onClick={() => handleSelectOption(selectType, option.value, field)}
            >
              {option.label}
              {currentValue.toString() === option.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderRatingStars = (rating: number, onRatingChange: (rating: number) => void) => (
    <div className={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.starButton} ${star <= rating ? styles.filled : ""}`}
          onClick={() => onRatingChange(star)}
        >
          <Star size={20} />
        </button>
      ))}
      <span className={styles.ratingText}>{rating > 0 ? `${rating}/5` : "No rating"}</span>
    </div>
  )

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <User className={styles.stepIcon} />
        </div>
        <h2>Basic Information</h2>
        <p>Let's start with your essential professional details</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.formLabel}>
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={managerData.phone}
            onChange={(e) => updateManagerData("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Department</label>
          {renderCustomSelect(
            [
              { value: "sales", label: "Sales" },
              { value: "marketing", label: "Marketing" },
              { value: "operations", label: "Operations" },
              { value: "finance", label: "Finance" },
              { value: "hr", label: "Human Resources" },
              { value: "it", label: "Information Technology" },
              { value: "customer-service", label: "Customer Service" },
              { value: "other", label: "Other" },
            ],
            "Select department",
            "department",
            "department",
            managerData.department,
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Status</label>
          {renderCustomSelect(
            [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            "Select status",
            "status",
            "status",
            managerData.status,
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Years of Experience</label>
          {renderCustomSelect(
            [
              { value: "0", label: "Less than 1 year" },
              { value: "1", label: "1 year" },
              { value: "2", label: "2 years" },
              { value: "3", label: "3 years" },
              { value: "4", label: "4 years" },
              { value: "5", label: "5 years" },
              { value: "6", label: "6-10 years" },
              { value: "11", label: "11-15 years" },
              { value: "16", label: "16+ years" },
            ],
            "Select experience",
            "experience",
            "experience",
            managerData.experience,
          )}
        </div>
      </div>
    </div>
  )

  // Step 2: Profile & Media
  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <Building className={styles.stepIcon} />
        </div>
        <h2>Profile & Media</h2>
        <p>Add your profile photo and professional website</p>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="profilePhoto" className={styles.formLabel}>
            Profile Photo URL
          </label>
          <div className={styles.photoUploadContainer}>
            <input
              id="profilePhoto"
              type="url"
              value={managerData.profilePhoto}
              onChange={(e) => updateManagerData("profilePhoto", e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className={styles.formInput}
            />
            <button type="button" className={styles.uploadBtn}>
              <Upload size={16} />
            </button>
          </div>
          {managerData.profilePhoto && (
            <div className={styles.imagePreview}>
              <img
                src={managerData.profilePhoto || "/placeholder.svg"}
                alt="Profile preview"
                className={styles.previewImage}
              />
            </div>
          )}
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="website" className={styles.formLabel}>
            Professional Website
          </label>
          <input
            id="website"
            type="url"
            value={managerData.website}
            onChange={(e) => updateManagerData("website", e.target.value)}
            placeholder="https://yourwebsite.com"
            className={styles.formInput}
          />
        </div>
      </div>
    </div>
  )

  // Step 3: Social Media
  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <Globe className={styles.stepIcon} />
        </div>
        <h2>Social Media Links</h2>
        <p>Connect your professional social media profiles</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="linkedin" className={styles.formLabel}>
            LinkedIn Profile
          </label>
          <input
            id="linkedin"
            type="url"
            value={managerData.socialMedia.linkedin}
            onChange={(e) => updateManagerData("socialMedia.linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="twitter" className={styles.formLabel}>
            Twitter Profile
          </label>
          <input
            id="twitter"
            type="url"
            value={managerData.socialMedia.twitter}
            onChange={(e) => updateManagerData("socialMedia.twitter", e.target.value)}
            placeholder="https://twitter.com/yourhandle"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="facebook" className={styles.formLabel}>
            Facebook Profile
          </label>
          <input
            id="facebook"
            type="url"
            value={managerData.socialMedia.facebook}
            onChange={(e) => updateManagerData("socialMedia.facebook", e.target.value)}
            placeholder="https://facebook.com/yourprofile"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="instagram" className={styles.formLabel}>
            Instagram Profile
          </label>
          <input
            id="instagram"
            type="url"
            value={managerData.socialMedia.instagram}
            onChange={(e) => updateManagerData("socialMedia.instagram", e.target.value)}
            placeholder="https://instagram.com/yourhandle"
            className={styles.formInput}
          />
        </div>
      </div>
    </div>
  )

  // Step 4: Rating & Review
  const renderStep4 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <Star className={styles.stepIcon} />
        </div>
        <h2>Professional Rating</h2>
        <p>Set your initial professional rating (this can be updated later)</p>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Professional Rating</label>
          <div className={styles.ratingSection}>
            {renderRatingStars(managerData.rating, (rating) => updateManagerData("rating", rating))}
            <p className={styles.ratingDescription}>
              This rating represents your professional competency and will be visible to clients. You can update this
              later based on client feedback.
            </p>
          </div>
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <div className={styles.summaryCard}>
            <h3>Profile Summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Phone:</span>
                <span className={styles.summaryValue}>{managerData.phone || "Not provided"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Department:</span>
                <span className={styles.summaryValue}>{managerData.department || "Not selected"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Experience:</span>
                <span className={styles.summaryValue}>
                  {managerData.experience === 0 ? "Less than 1 year" : `${managerData.experience} years`}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Status:</span>
                <span className={styles.summaryValue}>{managerData.status}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Rating:</span>
                <span className={styles.summaryValue}>{managerData.rating}/5 stars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.profileFormContainer}>
      <div className={styles.formWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Create Manager Profile</h1>
            {renderProgressBar()}
          </div>

          <div className={styles.cardContent}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className={styles.formActions}>
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className={`${styles.actionBtn} ${styles.secondary}`}>
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className={`${styles.actionBtn} ${styles.primary}`}>
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className={`${styles.actionBtn} ${styles.primary}`}>
                  Create Profile
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

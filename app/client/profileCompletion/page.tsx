"use client"

import { useState, useEffect } from "react"
import { Upload, User, Building, CreditCard, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import styles from "../../../styling/profileForm.module.css"
import API_ROUTES from "../../apiRoutes";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Stripe imports


interface ClientData {
  name: string
  description: string
  industry: string
  contactPerson: {
    name: string
    email: string
    phone: string
  }
  status: string
  tags: string[]
  profilePhoto: string
  billingInfo: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentInfo: {
    stripePaymentMethodId: string
    cardLast4: string
    cardBrand: string
    cardExpMonth: number
    cardExpYear: number
    cardHolderName: string
    isDefault: boolean
  }
}

export default function CreateProfilePage() {
  const stripe = useStripe();
  const elements = useElements();
  const [currentStep, setCurrentStep] = useState(1)
  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    description: "",
    industry: "",
    contactPerson: {
      name: "",
      email: "",
      phone: "",
    },
    status: "active",
    tags: [],
    profilePhoto: "",
    billingInfo: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    paymentInfo: {
      stripePaymentMethodId: "",
      cardLast4: "",
      cardBrand: "",
      cardExpMonth: 0,
      cardExpYear: 0,
      cardHolderName: "",
      isDefault: true,
    },
  })
  const [newTag, setNewTag] = useState("")
  const [isSelectOpen, setIsSelectOpen] = useState({
    industry: false,
    status: false,
    country: false,
    cardType: false,
  })

  // Cloudinary config from environment variables
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Stripe-related state
  
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Initialize Stripe
  useEffect(() => {
  if (stripe && elements) {
    setStripeLoaded(true);
  }
}, [stripe, elements]);

  // Initialize card element when elements is ready AND user is on step 4

  // Cleanup card element on unmount
  

  // Validation helpers for each step
  const isStep1Valid =
    clientData.name.trim() !== "" &&
    clientData.industry.trim() !== "" &&
    clientData.contactPerson.name.trim() !== "" &&
    clientData.contactPerson.email.trim() !== "" &&
    clientData.contactPerson.phone.trim() !== "";

  const isStep2Valid =
    clientData.status.trim() !== "" &&
    clientData.profilePhoto.trim() !== "";

  const isStep3Valid =
    clientData.billingInfo.address.trim() !== "" &&
    clientData.billingInfo.city.trim() !== "" &&
    clientData.billingInfo.state.trim() !== "" &&
    clientData.billingInfo.zipCode.trim() !== "" &&
    clientData.billingInfo.country.trim() !== "";

  const [cardComplete, setCardComplete] = useState(false);

  const isStep4Valid =
    clientData.paymentInfo.cardHolderName.trim() !== "" &&
    cardComplete &&
    stripeLoaded;

  // Optionally, show a warning if user tries to proceed with missing fields
  const [showStepWarning, setShowStepWarning] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const updateClientData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setClientData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ClientData] as any),
          [child]: value,
        },
      }))
    } else {
      setClientData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !clientData.tags.includes(newTag.trim())) {
      setClientData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setClientData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const nextStep = () => {
    let valid = false;
    if (currentStep === 1) valid = isStep1Valid;
    if (currentStep === 2) valid = isStep2Valid;
    if (currentStep === 3) valid = isStep3Valid;
    if (valid) {
      setCurrentStep(currentStep + 1);
      setShowStepWarning(false);
    } else {
      setShowStepWarning(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

 const createPaymentMethod = async () => {
  if (!stripe || !elements) throw new Error("Stripe not initialized");

  setPaymentProcessing(true);
  setPaymentError(null);

  const card = elements.getElement(CardElement);
  if (!card) throw new Error("CardElement not found");

  try {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: card,
      billing_details: {
        name: clientData.paymentInfo.cardHolderName,
        address: {
          line1: clientData.billingInfo.address,
          city: clientData.billingInfo.city,
          state: clientData.billingInfo.state,
          postal_code: clientData.billingInfo.zipCode,
          country: clientData.billingInfo.country,
        },
      },
    });

    if (error) throw new Error(error.message);
    return paymentMethod;
  } catch (err: any) {
    setPaymentError(err.message);
    throw err;
  } finally {
    setPaymentProcessing(false);
  }
};

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      // 1. Create client
      const res = await fetch(API_ROUTES.CLIENTS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(clientData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create client");
      }
      const clientId = data.data._id;

      // 2. Add billing info (if present)
      if (clientData.billingInfo && clientId) {
        const billingRes = await fetch(API_ROUTES.CLIENTS.ADD_OR_UPDATE_BILLING(clientId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ billingInfo: clientData.billingInfo }),
        });
        const billingData = await billingRes.json();
        if (!billingRes.ok || !billingData.success) {
          throw new Error(billingData.message || "Failed to add billing info");
        }
      }

      // 3. Create and add payment method if Stripe is available
     if (stripe && elements && clientData.paymentInfo.cardHolderName) {
        try {
          const paymentMethod = await createPaymentMethod();
          
          // Add payment method to client
          const paymentRes = await fetch(API_ROUTES.CLIENTS.ADD_PAYMENT_METHOD(clientId), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              paymentMethodId: paymentMethod.id,
              cardHolderName: clientData.paymentInfo.cardHolderName,
            }),
          });
          
          const paymentData = await paymentRes.json();
          if (!paymentRes.ok || !paymentData.success) {
            console.warn("Failed to add payment method:", paymentData.message);
            // Don't fail the entire process if payment method fails
          }
        } catch (paymentErr) {
          console.warn("Payment method creation failed:", paymentErr);
          // Don't fail the entire process if payment method fails
        }
      }

      setSubmitSuccess(true);
      // Optionally redirect or reset form here
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSelectToggle = (selectType: keyof typeof isSelectOpen) => {
    setIsSelectOpen((prev) => ({
      ...prev,
      [selectType]: !prev[selectType],
    }))
  }

  const handleSelectOption = (selectType: keyof typeof isSelectOpen, value: string, field: string) => {
    updateClientData(field, value)
    setIsSelectOpen((prev) => ({
      ...prev,
      [selectType]: false,
    }))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setClientData((prev) => ({ ...prev, profilePhoto: data.secure_url }));
      } else {
        setUploadError("Failed to upload image to Cloudinary");
      }
    } catch (err) {
      setUploadError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

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
    currentValue: string,
  ) => (
    <div className={styles.customSelectContainer}>
      <div
        className={`${styles.customSelectTrigger} ${isSelectOpen[selectType] ? styles.open : ""}`}
        onClick={() => handleSelectToggle(selectType)}
      >
        <span className={currentValue ? "" : styles.placeholder}>
          {currentValue ? options.find((opt) => opt.value === currentValue)?.label : placeholder}
        </span>
        <ChevronRight className={`${styles.selectArrow} ${isSelectOpen[selectType] ? styles.rotated : ""}`} size={16} />
      </div>
      {isSelectOpen[selectType] && (
        <div className={styles.customSelectDropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.customSelectOption} ${currentValue === option.value ? styles.selected : ""}`}
              onClick={() => handleSelectOption(selectType, option.value, field)}
            >
              {option.label}
              {currentValue === option.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <User className={styles.stepIcon} />
        </div>
        <h2>Basic Information</h2>
        <p>Let's start with the essential details about your client</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.formLabel}>
            Client Name *
          </label>
          <input
            id="name"
            type="text"
            value={clientData.name}
            onChange={(e) => updateClientData("name", e.target.value)}
            placeholder="Enter client name"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Industry</label>
          {renderCustomSelect(
            [
              { value: "technology", label: "Technology" },
              { value: "healthcare", label: "Healthcare" },
              { value: "finance", label: "Finance" },
              { value: "retail", label: "Retail" },
              { value: "manufacturing", label: "Manufacturing" },
              { value: "other", label: "Other" },
            ],
            "Select industry",
            "industry",
            "industry",
            clientData.industry,
          )}
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="description" className={styles.formLabel}>
            Description
          </label>
          <textarea
            id="description"
            value={clientData.description}
            onChange={(e) => updateClientData("description", e.target.value)}
            placeholder="Brief description about the client"
            className={styles.formTextarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contactName" className={styles.formLabel}>
            Contact Person Name
          </label>
          <input
            id="contactName"
            type="text"
            value={clientData.contactPerson.name}
            onChange={(e) => updateClientData("contactPerson.name", e.target.value)}
            placeholder="Contact person name"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contactEmail" className={styles.formLabel}>
            Contact Email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={clientData.contactPerson.email}
            onChange={(e) => updateClientData("contactPerson.email", e.target.value)}
            placeholder="contact@example.com"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contactPhone" className={styles.formLabel}>
            Contact Phone
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={clientData.contactPerson.phone}
            onChange={(e) => updateClientData("contactPerson.phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={styles.formInput}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <Building className={styles.stepIcon} />
        </div>
        <h2>Additional Details</h2>
        <p>Configure status, tags, and profile settings</p>
      </div>

      <div className={styles.formGrid}>
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
            clientData.status,
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="profilePhoto" className={styles.formLabel}>
            Profile Photo
          </label>
          <div className={styles.photoUploadContainer}>
            <input
              id="profilePhoto"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className={styles.formInput}
            />
            {uploading ? (
              <span className={styles.uploadingText}>Uploading...</span>
            ) : clientData.profilePhoto ? (
              <img
                src={clientData.profilePhoto}
                alt="Profile Preview"
                className={styles.profilePhotoPreview}
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", marginLeft: 8 }}
              />
            ) : null}
            <button type="button" className={styles.uploadBtn} disabled>
              <Upload size={16} />
            </button>
          </div>
          {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Tags</label>
          <div className={styles.tagsContainer}>
            <div className={styles.tagInputContainer}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className={styles.formInput}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag} className={styles.addTagBtn}>
                Add
              </button>
            </div>
            <div className={styles.tagsList}>
              {clientData.tags.map((tag, index) => (
                <div key={index} className={styles.tagBadge}>
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className={styles.tagRemove}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <CreditCard className={styles.stepIcon} />
        </div>
        <h2>Billing Information</h2>
        <p>Complete the setup with billing details</p>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="address" className={styles.formLabel}>
            Address
          </label>
          <input
            id="address"
            type="text"
            value={clientData.billingInfo.address}
            onChange={(e) => updateClientData("billingInfo.address", e.target.value)}
            placeholder="Street address"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="city" className={styles.formLabel}>
            City
          </label>
          <input
            id="city"
            type="text"
            value={clientData.billingInfo.city}
            onChange={(e) => updateClientData("billingInfo.city", e.target.value)}
            placeholder="City"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="state" className={styles.formLabel}>
            State
          </label>
          <input
            id="state"
            type="text"
            value={clientData.billingInfo.state}
            onChange={(e) => updateClientData("billingInfo.state", e.target.value)}
            placeholder="State"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="zipCode" className={styles.formLabel}>
            ZIP Code
          </label>
          <input
            id="zipCode"
            type="text"
            value={clientData.billingInfo.zipCode}
            onChange={(e) => updateClientData("billingInfo.zipCode", e.target.value)}
            placeholder="ZIP Code"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Country</label>
          {renderCustomSelect(
            [
              { value: "us", label: "United States" },
              { value: "ca", label: "Canada" },
              { value: "uk", label: "United Kingdom" },
              { value: "au", label: "Australia" },
              { value: "de", label: "Germany" },
              { value: "fr", label: "France" },
              { value: "other", label: "Other" },
            ],
            "Select country",
            "country",
            "billingInfo.country",
            clientData.billingInfo.country,
          )}
        </div>
      </div>
    </div>
  )
const renderStep4 = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIconContainer}>
          <CreditCard className={styles.stepIcon} />
        </div>
        <h2>Payment Information</h2>
        <p>Add your payment details securely with Stripe</p>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="cardHolderName" className={styles.formLabel}>
            Card Holder Name *
          </label>
          <input
            id="cardHolderName"
            type="text"
            value={clientData.paymentInfo.cardHolderName}
            onChange={(e) => updateClientData("paymentInfo.cardHolderName", e.target.value)}
            placeholder="Full name on card"
            className={styles.formInput}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
  <label className={styles.formLabel}>Card Details *</label>
  <div className={styles.stripeElementContainer}>
    <CardElement
      options={{
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      }}
      onChange={({ error, complete }) => {
        setPaymentError(error ? error.message : null);
        setCardComplete(complete);
      }}
    />
    {paymentError && (
      <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
        {paymentError}
      </div>
    )}
    {cardComplete && (
      <div style={{ color: '#27ae60', fontSize: '12px', marginTop: '4px' }}>
        ✓ Card details are valid
      </div>
    )}
  </div>
</div>


        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            <p>💳 <strong>Supported cards:</strong> Visa, Mastercard, American Express, Discover</p>
            <p>🔒 <strong>Security:</strong> Your payment information is encrypted and secure</p>
          </div>
        </div>

        {clientData.paymentInfo.cardLast4 && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Current Payment Method</label>
            <div className={styles.paymentMethodDisplay}>
              <span>**** **** **** {clientData.paymentInfo.cardLast4}</span>
              <span className={styles.cardBrand}>{clientData.paymentInfo.cardBrand?.toUpperCase()}</span>
              <span className={styles.cardExpiry}>
                {clientData.paymentInfo.cardExpMonth}/{clientData.paymentInfo.cardExpYear}
              </span>
            </div>
          </div>
        )}

        {paymentError && (
          <div className={styles.errorMessage} style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
            Payment Error: {paymentError}
          </div>
        )}

        {paymentProcessing && (
          <div className={styles.processingMessage} style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Processing payment method...
          </div>
        )}

        <div className={styles.stripeNote} style={{ fontSize: '12px', color: '#666', marginTop: '16px' }}>
          <p>💳 Your payment information is securely processed by Stripe.</p>
          <p>🔒 We never store your card details on our servers.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.profileFormContainer}>
      <div className={styles.formWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Create Client Profile</h1>
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
                <button
                  type="button"
                  onClick={nextStep}
                  className={`${styles.actionBtn} ${styles.primary}`}
                  disabled={
                    (currentStep === 1 && !isStep1Valid) ||
                    (currentStep === 2 && !isStep2Valid) ||
                    (currentStep === 3 && !isStep3Valid)
                  }
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`${styles.actionBtn} ${styles.primary}`}
                  disabled={!isStep4Valid || submitLoading}
                >
                  {submitLoading ? "Creating..." : (<><span>Create Profile</span><Check size={16} /></>)}
                </button>
              )}
            </div>
            {showStepWarning && (
              <div className={styles.stepWarning} style={{ color: 'red', fontWeight: 'bold', marginTop: 8 }}>
                Please complete all required fields before proceeding to the next step.
              </div>
            )}
            {submitError && (
              <div className={styles.stepWarning} style={{ color: 'red', fontWeight: 'bold', marginTop: 8 }}>
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className={styles.stepWarning} style={{ color: 'green', fontWeight: 'bold', marginTop: 8 }}>
                Client profile created successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

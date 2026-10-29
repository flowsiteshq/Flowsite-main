ALTER TABLE client_accounts
  ADD COLUMN industry VARCHAR(120) NULL,
  ADD COLUMN customerType ENUM('individual','business') NOT NULL DEFAULT 'business',
  ADD COLUMN referralSource VARCHAR(120) NULL,
  ADD COLUMN preferredCommunicationMethod ENUM('email','phone','sms','either') NOT NULL DEFAULT 'email',
  ADD COLUMN billingAddress VARCHAR(255) NULL,
  ADD COLUMN billingCity VARCHAR(120) NULL,
  ADD COLUMN billingState VARCHAR(80) NULL,
  ADD COLUMN billingZip VARCHAR(20) NULL,
  ADD COLUMN billingCountry VARCHAR(80) NOT NULL DEFAULT 'United States',
  ADD COLUMN authorizedContactsJson TEXT NULL,
  ADD COLUMN servicesJson TEXT NULL,
  ADD COLUMN paymentArrangementJson TEXT NULL,
  ADD COLUMN communicationPreference VARCHAR(40) NOT NULL DEFAULT 'none';

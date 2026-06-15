import type { FormEvent } from 'react';
import type { StepOneForm, Gender } from '../../types/registration';

type StepIdentityProps = {
  form: StepOneForm;
  onChange: (patch: Partial<StepOneForm>) => void;
  onNext: () => void;
};

const AGE_OPTIONS = [
  { value: 'moins18', label: 'Moins de 18 ans' },
  { value: '18-25', label: '18 - 25 ans' },
  { value: '26-35', label: '26 - 35 ans' },
  { value: '36-45', label: '36 - 45 ans' },
  { value: '46-55', label: '46 - 55 ans' },
  { value: '56-65', label: '56 - 65 ans' },
  { value: 'plus65', label: 'Plus de 65 ans' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
  { value: 'A', label: 'Autre' },
];

export function StepIdentity({ form, onChange, onNext }: StepIdentityProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="figma-step-form" onSubmit={handleSubmit}>
      <h2 className="card-title">
        Informations <span>Personnelles</span>
      </h2>
      <p className="card-sub">
        Étape 1 sur 5 — Remplissez vos informations pour devenir supporter officiel AS Simba.
      </p>

      <div className="section-label">Identité</div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstname">
            Prénom <span className="req">*</span>
          </label>
          <input
            id="firstname"
            type="text"
            placeholder="Jean"
            value={form.firstname}
            onChange={(e) => onChange({ firstname: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastname">
            Nom <span className="req">*</span>
          </label>
          <input
            id="lastname"
            type="text"
            placeholder="Mutombo"
            value={form.lastname}
            onChange={(e) => onChange({ lastname: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <span className="field-label">
          Genre <span className="req">*</span>
        </span>
        <div className="genre-group" role="group" aria-label="Genre">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`genre-btn${form.gender === option.value ? ' selected' : ''}`}
              aria-pressed={form.gender === option.value}
              onClick={() => onChange({ gender: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="ageRange">
          Tranche d&apos;âge <span className="req">*</span>
        </label>
        <select
          id="ageRange"
          value={form.ageRange}
          onChange={(e) => onChange({ ageRange: e.target.value })}
          required
        >
          <option value="">Sélectionner votre tranche</option>
          {AGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="section-label">Naissance</div>

      <div className="form-group">
        <span className="field-label">
          Date de naissance <span className="req">*</span>
        </span>
        <div className="dob-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="JJ"
            maxLength={2}
            value={form.birthDay}
            onChange={(e) => onChange({ birthDay: e.target.value.replace(/\D/g, '') })}
            required
            aria-label="Jour de naissance"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM"
            maxLength={2}
            value={form.birthMonth}
            onChange={(e) => onChange({ birthMonth: e.target.value.replace(/\D/g, '') })}
            required
            aria-label="Mois de naissance"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="AAAA"
            maxLength={4}
            value={form.birthYear}
            onChange={(e) => onChange({ birthYear: e.target.value.replace(/\D/g, '') })}
            required
            aria-label="Année de naissance"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="birthPlace">Lieu de naissance</label>
        <input
          id="birthPlace"
          type="text"
          placeholder="Kinshasa"
          value={form.birthPlace}
          onChange={(e) => onChange({ birthPlace: e.target.value })}
        />
      </div>

      <div className="divider" />

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="jean@exemple.com"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">
          Téléphone <span className="req">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+243 8XX XXX XXX"
          value={form.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">Ville de résidence</label>
        <input
          id="city"
          type="text"
          placeholder="Lubumbashi"
          value={form.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Suivant
      </button>
    </form>
  );
}

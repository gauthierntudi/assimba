import type { FormEvent } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { PAYS_MONDE, PROVINCES_RDC } from '../../data/locations';
import { SelectChevron } from '../icons/SelectChevron';
import { SOCIAL_NETWORKS, SocialIcon } from '../icons/SocialIcon';
import type { CountryStatus, StepTwoForm } from '../../types/registration';

type StepContactMobileProps = {
  form: StepTwoForm;
  formId: string;
  onChange: (patch: Partial<StepTwoForm>) => void;
  onNext: () => void;
};

export function StepContactMobile({ form, formId, onChange, onNext }: StepContactMobileProps) {
  const regionOptions = form.countryStatus === 'RDC' ? PROVINCES_RDC : PAYS_MONDE;
  const regionLabel = form.countryStatus === 'RDC' ? 'Votre province' : 'Pays de résidence';

  const isInRdc = form.countryStatus === 'RDC';

  const handleCountryStatus = (status: CountryStatus) => {
    onChange({
      countryStatus: status,
      province: '',
      ...(status === 'HORS_RDC' ? { town: '' } : {}),
    });
  };

  const toggleSocial = (key: keyof Pick<StepTwoForm, 'socialFb' | 'socialIg' | 'socialTt' | 'socialX'>) => {
    onChange({ [key]: !form[key] });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form id={formId} className="reg-mobile__form reg-mobile__form--contact" onSubmit={handleSubmit}>
      <section className="reg-mobile__section">
        <h2 className="reg-mobile__section-title">Coordonnées</h2>
        <p className="reg-mobile__section-desc reg-mobile__section-desc--medium">
          Où habitez-vous actuellement?
        </p>

        <div className="reg-mobile__location-toggle" role="radiogroup" aria-label="Lieu de résidence">
          <button
            type="button"
            role="radio"
            aria-checked={form.countryStatus === 'RDC'}
            className={`reg-mobile__location-option${form.countryStatus === 'RDC' ? ' reg-mobile__location-option--active' : ''}`}
            onClick={() => handleCountryStatus('RDC')}
          >
            <MapPin size={18} strokeWidth={1.75} aria-hidden="true" />
            En RDC
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={form.countryStatus === 'HORS_RDC'}
            className={`reg-mobile__location-option${form.countryStatus === 'HORS_RDC' ? ' reg-mobile__location-option--active' : ''}`}
            onClick={() => handleCountryStatus('HORS_RDC')}
          >
            <Globe size={20} strokeWidth={1.75} aria-hidden="true" />
            Hors RDC
          </button>
        </div>

        <label className="reg-mobile__field reg-mobile__field--select">
          <span className="visually-hidden">{regionLabel}</span>
          <select
            value={form.province}
            onChange={(e) => onChange({ province: e.target.value })}
            required
          >
            <option value="" disabled>
              {regionLabel}
            </option>
            {regionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <SelectChevron className="reg-mobile__field-chevron" />
        </label>

        <label className="reg-mobile__field">
          <span className="visually-hidden">Ville</span>
          <input
            type="text"
            placeholder="Ville"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
            required
          />
        </label>

        {isInRdc && (
          <label className="reg-mobile__field">
            <span className="visually-hidden">Commune/quartier</span>
            <input
              type="text"
              placeholder="Commune/quartier"
              value={form.town}
              onChange={(e) => onChange({ town: e.target.value })}
              required
            />
          </label>
        )}
      </section>

      <section className="reg-mobile__section">
        <h2 className="reg-mobile__section-title">Réseaux sociaux</h2>
        <p className="reg-mobile__section-desc">
          Sur quels réseaux sociaux êtes-vous actif?
        </p>

        <div className="reg-mobile__social-grid">
          {SOCIAL_NETWORKS.map(({ key, label, network }) => {
            const selected = form[key];
            return (
              <button
                key={key}
                type="button"
                className={[
                  'reg-mobile__social-card',
                  `reg-mobile__social-card--${network}`,
                  selected ? 'reg-mobile__social-card--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={selected}
                onClick={() => toggleSocial(key)}
              >
                <span className="reg-mobile__social-icon">
                  <SocialIcon network={network} />
                </span>
                <span className="reg-mobile__social-label">{label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </form>
  );
}

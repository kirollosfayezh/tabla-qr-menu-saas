import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'Terms of Service · Tabla' };

export default async function TermsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('legal.terms');
  return (
    <>
      <h1>{t('title')}</h1>
      <p className="text-text-tertiary">{t('lastUpdated', { date: '2026-05-27' })}</p>

      <h2>{t('s1.title')}</h2>
      <p>{t('s1.body')}</p>

      <h2>{t('s2.title')}</h2>
      <p>{t('s2.body')}</p>

      <h2>{t('s3.title')}</h2>
      <p>{t('s3.body')}</p>

      <h2>{t('s4.title')}</h2>
      <p>{t('s4.body')}</p>

      <h2>{t('s5.title')}</h2>
      <p>{t('s5.body')}</p>

      <h2>{t('s6.title')}</h2>
      <p>{t('s6.body')}</p>

      <h2>{t('contact.title')}</h2>
      <p>{t('contact.body')}</p>
    </>
  );
}

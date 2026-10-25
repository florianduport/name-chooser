import type { Locale } from '@/lib/i18n';

export const LEGAL_PAGE_KEYS = ['privacy', 'legal-notice', 'cookies'] as const;
export type LegalPageKey = (typeof LEGAL_PAGE_KEYS)[number];

type LegalPageCopy = {
  title: string;
  description: string;
  updated: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
};

type LegalLocaleCopy = {
  back: string;
  navigation: string;
  pages: Record<LegalPageKey, LegalPageCopy>;
};

export const LEGAL_COPY: Record<Locale, LegalLocaleCopy> = {
  fr: {
    back: 'Retour à LeBabyName',
    navigation: 'Informations légales',
    pages: {
      privacy: {
        title: 'Politique de confidentialité',
        description: 'Comment LeBabyName utilise et protège vos données.',
        updated: 'Mise à jour : 25 octobre 2026',
        sections: [
          { title: 'Données traitées', paragraphs: ['LeBabyName traite les informations de compte fournies par Google, vos listes de prénoms, vos votes, vos résultats, vos invitations et les données techniques nécessaires au fonctionnement du service. Les résultats publics ne révèlent que le prénom gagnant associé à un lien difficile à deviner.'] },
          { title: 'Finalités et conservation', paragraphs: ['Ces données servent à authentifier votre compte, enregistrer vos duels, permettre la comparaison avec un partenaire, sécuriser le service et mesurer son utilisation. Les données de compte restent conservées tant que le compte est actif ou jusqu’à une demande de suppression, sous réserve des obligations légales.'] },
          { title: 'Services tiers', paragraphs: ['Google fournit la connexion et, après consentement, Google AdSense peut afficher des publicités. PostHog mesure l’usage après consentement, sur son infrastructure européenne configurée par défaut. Les liens d’affiliation peuvent transmettre au marchand que vous venez de LeBabyName, sans lui transmettre vos listes privées.'] },
          { title: 'Vos choix et vos droits', paragraphs: ['Vous pouvez refuser les cookies facultatifs sans perdre l’accès aux duels. Vous pouvez demander l’accès, la rectification ou la suppression de vos données auprès de l’éditeur du site. Les coordonnées légales de l’éditeur doivent être complétées dans la rubrique Mentions légales avant l’exploitation publique.'] },
        ],
      },
      'legal-notice': {
        title: 'Mentions légales',
        description: 'Informations relatives à l’éditeur et au fonctionnement de LeBabyName.',
        updated: 'Mise à jour : 25 octobre 2026',
        sections: [
          { title: 'Éditeur', paragraphs: ['Le service LeBabyName est édité par l’exploitant du domaine lebabyname.com. L’identité juridique, l’adresse, l’adresse de contact et, le cas échéant, les informations d’immatriculation doivent être renseignées ici par l’exploitant avant la mise en production commerciale.'] },
          { title: 'Hébergement', paragraphs: ['LeBabyName est déployé avec Docker et Coolify sur une infrastructure administrée par l’exploitant. Le nom et l’adresse postale de l’hébergeur final doivent être complétés ici par l’exploitant.'] },
          { title: 'Propriété intellectuelle', paragraphs: ['La marque, l’interface et les contenus propres à LeBabyName sont protégés. Les classements de prénoms restent attribués à leurs sources publiques respectives, indiquées sur les pages concernées.'] },
          { title: 'Financement', paragraphs: ['LeBabyName reste gratuit. Le service peut être financé par Google AdSense et par des liens d’affiliation identifiés comme sponsorisés. Ces mécanismes ne modifient pas les résultats des duels.'] },
        ],
      },
      cookies: {
        title: 'Politique relative aux cookies',
        description: 'Vos choix concernant les cookies, PostHog et Google AdSense.',
        updated: 'Mise à jour : 25 octobre 2026',
        sections: [
          { title: 'Stockage nécessaire', paragraphs: ['LeBabyName utilise des cookies ou stockages nécessaires pour la session, la langue, la sécurité et la mémorisation de votre choix de consentement. Ils sont indispensables au service ou demandés directement par vous.'] },
          { title: 'Mesure et publicité facultatives', paragraphs: ['PostHog et Google AdSense ne sont chargés qu’après votre acceptation. Si vous refusez, aucun script AdSense ou PostHog n’est chargé et aucune publicité n’est affichée dans les emplacements intégrés.'] },
          { title: 'Modifier votre choix', paragraphs: ['Vous pouvez effacer la donnée locale « lebabyname-cookie-consent » dans les réglages de votre navigateur pour afficher de nouveau la demande de consentement. Le refus n’empêche jamais de lancer ou de terminer un duel.'] },
          { title: 'Consentement Google dans l’EEE', paragraphs: ['Avant de diffuser des annonces personnalisées ou non personnalisées aux utilisateurs de l’EEE, du Royaume-Uni ou de Suisse, l’exploitant doit configurer une plateforme de gestion du consentement certifiée par Google et conforme au TCF de l’IAB. Le bandeau intégré désactive entièrement AdSense avant consentement mais ne remplace pas cette configuration Google.'] },
        ],
      },
    },
  },
  'en-GB': {
    back: 'Back to LeBabyName',
    navigation: 'Legal information',
    pages: {
      privacy: {
        title: 'Privacy policy', description: 'How LeBabyName uses and protects your data.', updated: 'Updated: 25 October 2026',
        sections: [
          { title: 'Data we process', paragraphs: ['LeBabyName processes account information supplied by Google, your name lists, votes, results, invitations and technical data needed to operate the service. Public result links reveal only the winning name behind a hard-to-guess link.'] },
          { title: 'Purposes and retention', paragraphs: ['We use this data to authenticate accounts, save duels, compare partner results, secure the service and understand usage. Account data is kept while the account is active or until deletion is requested, subject to legal requirements.'] },
          { title: 'Third-party services', paragraphs: ['Google provides sign-in and, after consent, Google AdSense may serve advertising. PostHog measures usage after consent using its EU infrastructure by default. Affiliate links may tell a merchant that you came from LeBabyName, but do not send your private lists.'] },
          { title: 'Your choices and rights', paragraphs: ['You may refuse optional cookies without losing access to duels. You may request access, correction or deletion from the site operator. The operator’s complete legal contact details must be added to the Legal notice before public commercial operation.'] },
        ],
      },
      'legal-notice': {
        title: 'Legal notice', description: 'Publisher and operating information for LeBabyName.', updated: 'Updated: 25 October 2026',
        sections: [
          { title: 'Publisher', paragraphs: ['LeBabyName is published by the operator of lebabyname.com. The operator must add its legal identity, address, contact address and registration details, where applicable, here before commercial production use.'] },
          { title: 'Hosting', paragraphs: ['LeBabyName is deployed with Docker and Coolify on infrastructure administered by the operator. The final hosting provider’s name and postal address must be completed here by the operator.'] },
          { title: 'Intellectual property', paragraphs: ['The LeBabyName brand, interface and original content are protected. Baby-name rankings remain attributed to their respective public sources on the relevant pages.'] },
          { title: 'Funding', paragraphs: ['LeBabyName remains free. The service may be funded by Google AdSense and affiliate links identified as sponsored. These mechanisms never alter duel results.'] },
        ],
      },
      cookies: {
        title: 'Cookie policy', description: 'Your choices about cookies, PostHog and Google AdSense.', updated: 'Updated: 25 October 2026',
        sections: [
          { title: 'Necessary storage', paragraphs: ['LeBabyName uses cookies or storage required for sessions, language, security and remembering your consent choice. These are essential to the service or directly requested by you.'] },
          { title: 'Optional measurement and advertising', paragraphs: ['PostHog and Google AdSense load only after you accept. If you refuse, no AdSense or PostHog script loads and no advertising is shown in the integrated slots.'] },
          { title: 'Changing your choice', paragraphs: ['Delete “lebabyname-cookie-consent” from your browser storage to see the consent request again. Refusing never prevents you from starting or completing a duel.'] },
          { title: 'Google consent in the EEA', paragraphs: ['Before serving personalised or non-personalised ads to people in the EEA, UK or Switzerland, the operator must configure a Google-certified consent management platform that supports the IAB TCF. The built-in banner keeps AdSense disabled before consent but does not replace that Google configuration.'] },
        ],
      },
    },
  },
  'en-US': {} as LegalLocaleCopy,
  es: {
    back: 'Volver a LeBabyName', navigation: 'Información legal',
    pages: {
      privacy: {
        title: 'Política de privacidad', description: 'Cómo LeBabyName utiliza y protege tus datos.', updated: 'Actualizado: 25 de octubre de 2026',
        sections: [
          { title: 'Datos tratados', paragraphs: ['LeBabyName trata los datos de cuenta facilitados por Google, tus listas de nombres, votos, resultados, invitaciones y los datos técnicos necesarios para prestar el servicio. Los enlaces públicos solo muestran el nombre ganador mediante una URL difícil de adivinar.'] },
          { title: 'Finalidad y conservación', paragraphs: ['Usamos estos datos para autenticar cuentas, guardar duelos, comparar resultados, proteger el servicio y conocer su uso. Los datos se conservan mientras la cuenta esté activa o hasta que se solicite su eliminación, salvo obligación legal.'] },
          { title: 'Servicios de terceros', paragraphs: ['Google facilita el acceso y, tras el consentimiento, Google AdSense puede mostrar publicidad. PostHog mide el uso tras el consentimiento mediante su infraestructura europea predeterminada. Los enlaces de afiliación pueden indicar al comercio que vienes de LeBabyName, sin enviar tus listas privadas.'] },
          { title: 'Tus derechos', paragraphs: ['Puedes rechazar las cookies opcionales sin perder acceso a los duelos. Puedes solicitar acceso, rectificación o supresión al operador. El operador debe completar sus datos de contacto en el Aviso legal antes de la explotación comercial.'] },
        ],
      },
      'legal-notice': {
        title: 'Aviso legal', description: 'Información sobre el editor y el funcionamiento de LeBabyName.', updated: 'Actualizado: 25 de octubre de 2026',
        sections: [
          { title: 'Editor', paragraphs: ['LeBabyName es publicado por el operador de lebabyname.com. Antes del uso comercial, el operador debe completar aquí su identidad jurídica, dirección, contacto y datos registrales aplicables.'] },
          { title: 'Alojamiento', paragraphs: ['LeBabyName se despliega con Docker y Coolify en infraestructura administrada por el operador. Deben añadirse aquí el nombre y la dirección postal del proveedor de alojamiento final.'] },
          { title: 'Propiedad intelectual', paragraphs: ['La marca, la interfaz y el contenido propio de LeBabyName están protegidos. Las clasificaciones de nombres se atribuyen a sus fuentes públicas en cada página.'] },
          { title: 'Financiación', paragraphs: ['LeBabyName seguirá siendo gratuito. Puede financiarse mediante Google AdSense y enlaces de afiliación identificados como patrocinados, sin alterar los resultados de los duelos.'] },
        ],
      },
      cookies: {
        title: 'Política de cookies', description: 'Tus opciones sobre cookies, PostHog y Google AdSense.', updated: 'Actualizado: 25 de octubre de 2026',
        sections: [
          { title: 'Almacenamiento necesario', paragraphs: ['LeBabyName utiliza cookies o almacenamiento necesarios para la sesión, el idioma, la seguridad y recordar tu elección de consentimiento.'] },
          { title: 'Medición y publicidad opcionales', paragraphs: ['PostHog y Google AdSense solo se cargan tras aceptar. Si rechazas, no se carga ningún script de AdSense o PostHog y no se muestra publicidad en los espacios integrados.'] },
          { title: 'Cambiar la elección', paragraphs: ['Elimina “lebabyname-cookie-consent” del almacenamiento del navegador para volver a mostrar la solicitud. Rechazar nunca impide iniciar o terminar un duelo.'] },
          { title: 'Consentimiento de Google en el EEE', paragraphs: ['Antes de mostrar anuncios personalizados o no personalizados en el EEE, Reino Unido o Suiza, el operador debe configurar una plataforma de consentimiento certificada por Google compatible con el TCF de IAB. El banner integrado bloquea AdSense antes del consentimiento, pero no sustituye esa configuración.'] },
        ],
      },
    },
  },
  pt: {
    back: 'Voltar ao LeBabyName', navigation: 'Informação legal',
    pages: {
      privacy: {
        title: 'Política de privacidade', description: 'Como o LeBabyName utiliza e protege os seus dados.', updated: 'Atualizado: 25 de outubro de 2026',
        sections: [
          { title: 'Dados tratados', paragraphs: ['O LeBabyName trata dados de conta fornecidos pela Google, listas de nomes, votos, resultados, convites e dados técnicos necessários ao serviço. As ligações públicas mostram apenas o nome vencedor através de um endereço difícil de adivinhar.'] },
          { title: 'Finalidades e conservação', paragraphs: ['Usamos estes dados para autenticar contas, guardar duelos, comparar resultados, proteger o serviço e compreender a utilização. Os dados são conservados enquanto a conta estiver ativa ou até ser pedida a eliminação, salvo obrigação legal.'] },
          { title: 'Serviços terceiros', paragraphs: ['A Google fornece o início de sessão e, após consentimento, o Google AdSense pode mostrar publicidade. O PostHog mede a utilização após consentimento através da infraestrutura europeia predefinida. As ligações de afiliados podem indicar ao comerciante que veio do LeBabyName, sem enviar listas privadas.'] },
          { title: 'Os seus direitos', paragraphs: ['Pode recusar cookies opcionais sem perder acesso aos duelos. Pode pedir acesso, correção ou eliminação ao operador. Os dados legais completos do operador devem ser adicionados ao Aviso legal antes da exploração comercial.'] },
        ],
      },
      'legal-notice': {
        title: 'Aviso legal', description: 'Informações sobre o editor e funcionamento do LeBabyName.', updated: 'Atualizado: 25 de outubro de 2026',
        sections: [
          { title: 'Editor', paragraphs: ['O LeBabyName é publicado pelo operador de lebabyname.com. Antes do uso comercial, o operador deve completar aqui a identidade jurídica, morada, contacto e dados de registo aplicáveis.'] },
          { title: 'Alojamento', paragraphs: ['O LeBabyName é implementado com Docker e Coolify numa infraestrutura administrada pelo operador. O nome e a morada do fornecedor de alojamento final devem ser adicionados aqui.'] },
          { title: 'Propriedade intelectual', paragraphs: ['A marca, interface e conteúdo próprio do LeBabyName estão protegidos. As classificações de nomes são atribuídas às respetivas fontes públicas em cada página.'] },
          { title: 'Financiamento', paragraphs: ['O LeBabyName permanece gratuito. Pode ser financiado pelo Google AdSense e por ligações de afiliados identificadas como patrocinadas, sem alterar os resultados dos duelos.'] },
        ],
      },
      cookies: {
        title: 'Política de cookies', description: 'As suas escolhas sobre cookies, PostHog e Google AdSense.', updated: 'Atualizado: 25 de outubro de 2026',
        sections: [
          { title: 'Armazenamento necessário', paragraphs: ['O LeBabyName usa cookies ou armazenamento necessários para sessão, idioma, segurança e para recordar a sua escolha de consentimento.'] },
          { title: 'Medição e publicidade opcionais', paragraphs: ['O PostHog e o Google AdSense só carregam após aceitar. Se recusar, nenhum script do AdSense ou PostHog é carregado e não é mostrada publicidade nos espaços integrados.'] },
          { title: 'Alterar a escolha', paragraphs: ['Elimine “lebabyname-cookie-consent” do armazenamento do navegador para voltar a ver o pedido. Recusar nunca impede iniciar ou terminar um duelo.'] },
          { title: 'Consentimento Google no EEE', paragraphs: ['Antes de apresentar anúncios personalizados ou não personalizados no EEE, Reino Unido ou Suíça, o operador deve configurar uma plataforma de consentimento certificada pela Google compatível com o TCF do IAB. O banner integrado bloqueia o AdSense antes do consentimento, mas não substitui essa configuração.'] },
        ],
      },
    },
  },
  it: {
    back: 'Torna a LeBabyName', navigation: 'Informazioni legali',
    pages: {
      privacy: {
        title: 'Informativa sulla privacy', description: 'Come LeBabyName utilizza e protegge i tuoi dati.', updated: 'Aggiornato: 25 ottobre 2026',
        sections: [
          { title: 'Dati trattati', paragraphs: ['LeBabyName tratta i dati dell’account forniti da Google, le liste di nomi, i voti, i risultati, gli inviti e i dati tecnici necessari al servizio. I link pubblici mostrano solo il nome vincitore tramite un indirizzo difficile da indovinare.'] },
          { title: 'Finalità e conservazione', paragraphs: ['Usiamo questi dati per autenticare gli account, salvare i duelli, confrontare i risultati, proteggere il servizio e comprenderne l’utilizzo. I dati restano conservati finché l’account è attivo o fino alla richiesta di cancellazione, salvo obblighi legali.'] },
          { title: 'Servizi di terze parti', paragraphs: ['Google fornisce l’accesso e, dopo il consenso, Google AdSense può mostrare pubblicità. PostHog misura l’utilizzo dopo il consenso tramite l’infrastruttura europea predefinita. I link affiliati possono indicare al commerciante che provieni da LeBabyName, senza trasmettere liste private.'] },
          { title: 'I tuoi diritti', paragraphs: ['Puoi rifiutare i cookie facoltativi senza perdere l’accesso ai duelli. Puoi chiedere accesso, rettifica o cancellazione all’operatore. I dati legali completi dell’operatore devono essere aggiunti alle Note legali prima dell’uso commerciale.'] },
        ],
      },
      'legal-notice': {
        title: 'Note legali', description: 'Informazioni sull’editore e sul funzionamento di LeBabyName.', updated: 'Aggiornato: 25 ottobre 2026',
        sections: [
          { title: 'Editore', paragraphs: ['LeBabyName è pubblicato dall’operatore di lebabyname.com. Prima dell’uso commerciale, l’operatore deve completare qui identità giuridica, indirizzo, contatto e dati di registrazione applicabili.'] },
          { title: 'Hosting', paragraphs: ['LeBabyName è distribuito con Docker e Coolify su un’infrastruttura amministrata dall’operatore. Il nome e l’indirizzo del fornitore di hosting finale devono essere aggiunti qui.'] },
          { title: 'Proprietà intellettuale', paragraphs: ['Il marchio, l’interfaccia e i contenuti originali di LeBabyName sono protetti. Le classifiche dei nomi sono attribuite alle rispettive fonti pubbliche nelle pagine interessate.'] },
          { title: 'Finanziamento', paragraphs: ['LeBabyName resta gratuito. Può essere finanziato da Google AdSense e link affiliati identificati come sponsorizzati, senza alterare i risultati dei duelli.'] },
        ],
      },
      cookies: {
        title: 'Informativa sui cookie', description: 'Le tue scelte su cookie, PostHog e Google AdSense.', updated: 'Aggiornato: 25 ottobre 2026',
        sections: [
          { title: 'Archiviazione necessaria', paragraphs: ['LeBabyName usa cookie o archiviazione necessari per sessione, lingua, sicurezza e per ricordare la scelta sul consenso.'] },
          { title: 'Misurazione e pubblicità facoltative', paragraphs: ['PostHog e Google AdSense vengono caricati solo dopo l’accettazione. Se rifiuti, non viene caricato alcuno script AdSense o PostHog e non viene mostrata pubblicità negli spazi integrati.'] },
          { title: 'Cambiare scelta', paragraphs: ['Elimina “lebabyname-cookie-consent” dall’archiviazione del browser per mostrare nuovamente la richiesta. Il rifiuto non impedisce mai di iniziare o terminare un duello.'] },
          { title: 'Consenso Google nel SEE', paragraphs: ['Prima di mostrare annunci personalizzati o non personalizzati nel SEE, Regno Unito o Svizzera, l’operatore deve configurare una piattaforma di consenso certificata da Google compatibile con il TCF IAB. Il banner integrato blocca AdSense prima del consenso, ma non sostituisce tale configurazione.'] },
        ],
      },
    },
  },
};

LEGAL_COPY['en-US'] = {
  ...LEGAL_COPY['en-GB'],
  pages: {
    ...LEGAL_COPY['en-GB'].pages,
    privacy: {
      ...LEGAL_COPY['en-GB'].pages.privacy,
      title: 'Privacy policy',
      updated: 'Updated: October 25, 2026',
    },
    'legal-notice': {
      ...LEGAL_COPY['en-GB'].pages['legal-notice'],
      updated: 'Updated: October 25, 2026',
    },
    cookies: {
      ...LEGAL_COPY['en-GB'].pages.cookies,
      updated: 'Updated: October 25, 2026',
    },
  },
};

export function isLegalPageKey(value: string): value is LegalPageKey {
  return LEGAL_PAGE_KEYS.includes(value as LegalPageKey);
}

export function legalPath(locale: Locale, page: LegalPageKey) {
  return `/${locale}/legal/${page}`;
}

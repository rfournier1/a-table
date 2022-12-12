import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';

export async function getStaticProps() {
  return {
    props: {
      clientId: process.env.NOTION_CLIENT_ID,
      redirectUri: process.env.NOTION_REDIRECT_URL,
    },
  };
}

function Login({
  clientId,
  redirectUri,
}: {
  clientId?: string;
  redirectUri?: string;
}) {
  const { query, push } = useRouter();
  useEffect(() => {
    if (query.code) {
      fetch(`/api/login?code=${query.code}`)
        .then((res) => res.json())
        .then(() => {
          push('/');
        });
    }
  }, [query, push]);
  return (
    <div className={styles.container}>
      {query.code ? (
        <>connecting...</>
      ) : (
        <a
          href={`https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}`}
        >
          Connect to notion
        </a>
      )}
    </div>
  );
}

export default Login;

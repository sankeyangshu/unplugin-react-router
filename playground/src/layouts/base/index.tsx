import { useOutlet } from 'react-router';

const BaseLayout = () => {
  const outlet = useOutlet();

  return (
    <>
      <h1>BaseLayout</h1>
      {outlet}
    </>
  );
};

export default BaseLayout;

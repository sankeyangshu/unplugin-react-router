import { useOutlet } from 'react-router';

const BlankLayout = () => {
  const outlet = useOutlet();

  return (
    <>
      <h1>BlankLayout</h1>
      {outlet}
    </>
  );
};

export default BlankLayout;

import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" pt="80px">
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
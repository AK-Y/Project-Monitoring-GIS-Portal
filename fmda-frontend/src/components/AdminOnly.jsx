import { useSelector } from 'react-redux';

/**
 * A wrapper component that only renders its children if the current user has the ADMIN role.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to show to admins
 * @param {React.ReactNode} [props.fallback=null] - Optional content to show to non-admins
 */
const AdminOnly = ({ children, fallback = null }) => {
    const { user } = useSelector((state) => state.auth);

    if (user?.role === 'ADMIN') {
        return children;
    }

    return fallback;
};

export default AdminOnly;

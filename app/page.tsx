import Loader from "@/components/Loader";
import BrutalistPattern from "@/components/BrutalistPattern";

export default function Loading() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a'
    }}>
      <BrutalistPattern />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(26, 26, 26, 0.85)'
      }}>
        <Loader />
      </div>
    </div>
  );
}

import Loader from "@/components/Loader";
import BrutalistPattern from "@/components/BrutalistPattern";

export default function Loading() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#fff'
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
        backgroundColor: 'rgba(255, 255, 255, 0.85)'
      }}>
        <Loader />
      </div>
    </div>
  );
}

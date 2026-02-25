
const ProfileCardSkeleton = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white w-96 rounded-2xl shadow-xl overflow-hidden animate-pulse">
        
        {/* Image Placeholder */}
        <div className="h-80 bg-gray-300 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          
          {/* Name Placeholder */}
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>

          {/* Gender */}
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>

          {/* Skills */}
          <div className="h-4 bg-gray-300 rounded w-full"></div>

          {/* About */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-10 pt-4">
            <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
            <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;

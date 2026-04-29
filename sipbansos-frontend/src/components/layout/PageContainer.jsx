const PageContainer = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-orange/20 blur-3xl animate-float-soft" />
        <div
          className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-secondary-blue/20 blur-3xl animate-float-soft"
          style={{ animationDelay: "1.2s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-secondary-green/20 blur-3xl animate-float-soft"
          style={{ animationDelay: "2s" }}
        />
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 lg:px-6 lg:py-8">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;

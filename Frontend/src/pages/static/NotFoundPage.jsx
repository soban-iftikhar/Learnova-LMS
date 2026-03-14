import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import AppShell from '../../components/common/AppShell';
import Button from '../../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          {/* 404 Display */}
          <div className="text-center mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-primary mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-4">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Go Back
            </Button>
          </div>

          {/* Illustration */}
          <div className="mt-12 text-center">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-sm text-muted-foreground">
              You can also try searching for courses or checking the navigation menu
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default NotFoundPage;

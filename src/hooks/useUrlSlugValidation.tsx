import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UrlValidationResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  suggestion: string;
  error?: string;
}

export const useUrlSlugValidation = (name: string, currentSlug?: string) => {
  const [validationResult, setValidationResult] = useState<UrlValidationResult>({
    isChecking: false,
    isAvailable: null,
    suggestion: ''
  });

  // Generate URL-friendly slug from name
  const generateSlugFromName = useCallback((inputName: string): string => {
    if (!inputName.trim()) return '';
    
    let slug = inputName.toLowerCase().trim();
    // Remove special characters and replace spaces with hyphens
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    
    return slug || 'baby';
  }, []);

  // Check if URL slug is available
  const checkSlugAvailability = useCallback(async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    try {
      const { data, error } = await supabase
        .from('baby_info')
        .select('url_slug, id')
        .eq('url_slug', slug)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking slug availability:', error);
        return false;
      }
      
      // If no data found, slug is available
      // If data found but it's the current user's record, still available
      return !data || (currentSlug && data.url_slug === currentSlug);
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }, [currentSlug]);

  // Find next available slug with counter
  const findAvailableSlug = useCallback(async (baseSlug: string): Promise<string> => {
    let finalSlug = baseSlug;
    let counter = 1;
    
    while (!(await checkSlugAvailability(finalSlug))) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
      // Prevent infinite loop
      if (counter > 100) break;
    }
    
    return finalSlug;
  }, [checkSlugAvailability]);

  // Generate suggestion based on name
  useEffect(() => {
    const generateSuggestion = async () => {
      if (!name.trim()) {
        setValidationResult(prev => ({ ...prev, suggestion: '' }));
        return;
      }

      const baseSlug = generateSlugFromName(name);
      const availableSlug = await findAvailableSlug(baseSlug);
      
      setValidationResult(prev => ({ 
        ...prev, 
        suggestion: availableSlug 
      }));
    };

    generateSuggestion();
  }, [name, generateSlugFromName, findAvailableSlug]);

  // Validate specific slug
  const validateSlug = useCallback(async (slug: string) => {
    if (!slug) {
      setValidationResult(prev => ({ ...prev, isChecking: false, isAvailable: null }));
      return;
    }

    setValidationResult(prev => ({ ...prev, isChecking: true }));

    try {
      const isAvailable = await checkSlugAvailability(slug);
      setValidationResult(prev => ({
        ...prev,
        isChecking: false,
        isAvailable
      }));
    } catch (error) {
      setValidationResult(prev => ({
        ...prev,
        isChecking: false,
        isAvailable: false,
        error: 'Erro ao verificar disponibilidade'
      }));
    }
  }, [checkSlugAvailability]);

  return {
    validationResult,
    validateSlug,
    generateSlugFromName
  };
};
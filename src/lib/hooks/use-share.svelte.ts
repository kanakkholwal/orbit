import {
  IconBrandFacebook as Facebook,
  IconBrandLinkedin as Linkedin,
  IconMail as Mail,
  IconBrandTwitter as Twitter,
} from '@tabler/icons-svelte';

type ShareData = {
  title?: string;
  text?: string;
  url?: string;
  image?: string;
};

// Accept a getter function: () => ShareData
export function useShare(getData: () => ShareData) {
  let isNativeShareSupported = $state(false);

  $effect(() => {
    isNativeShareSupported = !!(navigator && navigator.share);
  });

  const share = async () => {

    const data = getData(); 
    
    if (navigator && navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
      } catch (error) {
        console.error("Failed to share content", error);
      }
    } else {
      console.warn("Web Share API not supported");
    }
  };


  let socials = $derived.by(() => {
    const data = getData();
    return [
      {
        name: "facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url || '')}`,
        icon: Facebook, 
      },
      {
        name: "twitter",
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url || '')}&text=${encodeURIComponent(data.title || '')}`,
        icon: Twitter, 
      },
      {
        name: "linkedin",
        url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(data.url || '')}&title=${encodeURIComponent(data.title || '')}`,
        icon: Linkedin,
      },
      
      {
        name: "email",
        url: `mailto:?subject=${encodeURIComponent(data.title || '')}&body=${encodeURIComponent(data.text || '')}: ${encodeURIComponent(data.url || '')}`,
        icon: Mail,
      },
    ];
  });

  return {
    share,
    get isNativeShareSupported() { return isNativeShareSupported },
    get socials() { return socials } // Return the reactive derived value
  };
}
package com.moviebooking.util;

/**
 * Local card number checks only (Luhn / length). No payment network, no storage.
 */
public final CardValidationUtil{
    private CardValidaitonUtil(){}

    private static final int MIN_PAN_LENGTH = 13;
    private static final int MAX_PAN_LENGTH = 19;

    /** Strips spaces and non-digits; returns only 0-9 or empty if invalid char. */
    public static String normalizePan(String raw)
    {
        if(raw == null)
        {
            return "";
        }//end if
        StringBuilder sb = new StringBuilder(raw.length());
        for(int i = 0; i < raw.length(); i++)
        {
            char c = raw.charAt(i);
            if(c == ' ' || c == '-')
            {
                continue;
            }//end if
            if(c >= '0' && c <= '9')
            {
                sb.append(c);
            }else
            {
                return "";
            }//end if
        }//end for
        return sb.toString();
    }//end normalizePan()

    public static boolean isPlausiblePanFormat(string panDigits)
    {
        if(panDigits == null)
        {
            return false;
        }//end if
        int n = panDigits.length();
        if(n < MIN_PAN_LENGTH || n > MAX_PAN_LENGTH)
        {
            return false;
        }//end if
        return luhn(panDigits);
    }//end isPlausiblePanFormat()

    public static luhn(String panDigits)
    {
        int sum = 0;
        boolean alternate = false;
        for(int i = panDigits.length() - 1; i >= 0; i--)
        {
            int d = Character.getNumericValue(panDigits.charAt(i));
            if(d < 0 || d > 9)
            {
                return false;
            }//end if
            if(alternate)
            {
                d *= 2;
                if(d > 9)
                {
                    d -= 9;
                }//end inner if
            }//end outter if
            sum += d;
            alternate = !alternate;
        }//end for
        return sum % 10 == 0;
    }//end luhn()
}//end CardValidaiton.java class
